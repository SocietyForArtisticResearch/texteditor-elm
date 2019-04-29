port module Main exposing (Msg(..), main, update, view)

import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Browser
import Dict
import Exposition
import File exposing (File)
import File.Select as Select
import Html exposing (Html, button, div, p, span, text)
import Html.Attributes exposing (attribute)
import Html.Events exposing (on, onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import RCAPI
import RCMediaEdit
import Regex
import String.Extra as Str


type alias Model msg =
    { exposition : Exposition.RCExposition msg
    , editGeneration : Int
    , mediaDialog : ( Modal.Visibility, String )
    , weave : Maybe Int
    , research : Maybe Int
    , apiExposition : Maybe RCAPI.APIExposition -- got from rc
    , uploadStatus : UploadStatus
    }


type UploadStatus
    = Ready
    | Uploading Float


type alias Flags =
    { weave : Int, research : Int }


decodeFlags : D.Decoder Flags
decodeFlags =
    D.map2 Flags (D.field "weave" D.int) (D.field "research" D.int)


init : D.Value -> ( Model msg, Cmd Msg )
init flags =
    case D.decodeValue decodeFlags flags of
        Ok fl ->
            ( { editGeneration = -1
              , exposition = Exposition.empty
              , mediaDialog = ( Modal.hidden, "" )
              , research = Just fl.research
              , weave = Just fl.weave
              , apiExposition = Nothing
              , uploadStatus = Ready
              }
            , RCAPI.getExposition fl.research fl.weave GotExposition
            )

        Err str ->
            let
                _ =
                    Debug.log "err" str
            in
            ( { editGeneration = -1
              , exposition = Exposition.empty
              , mediaDialog = ( Modal.hidden, "" )
              , research = Nothing
              , weave = Nothing
              , apiExposition = Nothing
              , uploadStatus = Ready
              }
            , Cmd.none
            )


debugObject :String -> Exposition.RCMediaObject
debugObject objectName =
    { userClass = ""
    , dimensions = Nothing
    , id = 1
    , htmlId = ""
    , thumb = "angryCatImage.png"
    , expositionId = 1
    , name = objectName
    , description = "description"
    , copyright = "Casper Schipper 2019"
    , caption = "CAPTION"
    , version = 1
    , mediaType = Exposition.RCImage
    }



-- DEBUG: just to have something to test in an empty 


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }


port currentGeneration : (E.Value -> msg) -> Sub msg


port cmContent : (E.Value -> msg) -> Sub msg


port getContent : () -> Cmd msg


port mediaDialog : (E.Value -> msg) -> Sub msg


subscriptions : Model msg -> Sub Msg
subscriptions model =
    Sub.batch
        [ currentGeneration EditGeneration
        , cmContent MdContent
        , mediaDialog MediaDialog
        , Http.track "upload" GotUploadProgress
        ]


type Msg
    = EditGeneration E.Value
    | MdContent E.Value
    | MediaDialog E.Value
    | MediaEdit Exposition.RCMediaObject
    | MediaDelete Exposition.RCMediaObject
    | InsertTool Exposition.RCMediaObject
    | CloseMediaDialog
    | GotExposition (Result Http.Error RCAPI.APIExposition)
    | GotMediaList (Result Http.Error (List RCAPI.APIMediaEntry))
    | UploadMediaFileSelect
    | UploadMediaFileSelected File
    | GotUploadProgress Http.Progress
    | Uploaded (Result Http.Error ())



--    | MediaReplace Exposition.RCMediaObject
-- not yet validated, only update request


makeMediaEditFun : Exposition.RCMediaObject -> RCMediaEdit.Field -> String -> Msg
makeMediaEditFun obj field input =
    case field of
        RCMediaEdit.Name ->
            MediaEdit { obj | name = input }

        RCMediaEdit.Description ->
            MediaEdit { obj | description = input }

        RCMediaEdit.UserClass ->
            MediaEdit { obj | userClass = input }

        RCMediaEdit.Copyright ->
            MediaEdit { obj | copyright = input }


makeMediaEditMsgs : Exposition.RCMediaObject -> RCMediaEdit.MediaEditMessages Msg
makeMediaEditMsgs obj =
    { insertTool = InsertTool obj
    , editTool = makeMediaEditFun obj
    , deleteTool = MediaDelete obj
    }


update : Msg -> Model msg -> ( Model msg, Cmd Msg )
update msg model =
    case msg of
        EditGeneration val ->
            case D.decodeValue D.int val of
                Ok gen ->
                    if gen /= model.editGeneration then
                        ( { model | editGeneration = gen }, getContent () )

                    else
                        ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        MdContent val ->
            case
                ( D.decodeValue (D.field "generation" D.int) val
                , D.decodeValue (D.field "content" D.string) val
                )
            of
                ( Ok gen, Ok content ) ->
                    ( { model
                        | editGeneration = gen
                        , exposition = Exposition.render (Exposition.withMd model.exposition content)
                      }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        MediaDialog val ->
            case D.decodeValue (D.field "media" D.string) val of
                Ok mediaNameOrId ->
                    ( { model | mediaDialog = ( Modal.shown, mediaNameOrId ) }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        CloseMediaDialog ->
            ( { model | mediaDialog = ( Modal.hidden, "" ) }, Cmd.none )

        GotExposition exp ->
            -- not implemented
            let
                _ =
                    Debug.log "gotexposition" exp
            in
            case model.research of
                Nothing ->
                    ( model, Cmd.none )

                Just id ->
                    ( model, RCAPI.getMediaList id GotMediaList )

        GotMediaList exp ->
            -- not implemented
            let
                _ =
                    Debug.log "gotmedialist" exp
            in
            ( model, Cmd.none )

        MediaEdit obj ->
            -- not implemented
            ( model, Cmd.none )

        MediaDelete obj ->
            -- not implemented
            ( model, Cmd.none )

        InsertTool obj ->
            -- not implemented
            ( model, Cmd.none )

        UploadMediaFileSelect ->
            ( model
            , Select.file [ "image/jpeg", "image/png" ] UploadMediaFileSelected
            )

        UploadMediaFileSelected file ->
            ( model
            , case model.research of
                Nothing ->
                    Cmd.none

                Just id ->
                    Http.request
                        { method = "POST"
                        , url = "text-editor/simple-media-add" ++ "?research=" ++ String.fromInt id
                        , headers = []
                        , body =
                            Http.multipartBody
                                [ Http.stringPart "mediatype" "image"
                                , Http.stringPart "name" "--TODO: mpName"
                                , Http.stringPart "copyrightholder" "copyrightholder"
                                , Http.stringPart "description" "description"
                                , Http.filePart "media" file
                                , Http.stringPart "thumb" ""
                                ]
                        , expect = Http.expectWhatever Uploaded
                        , timeout = Nothing
                        , tracker = Just "upload"
                        }
            )

        GotUploadProgress progress ->
            case progress of
                Http.Sending p ->
                    ( { model | uploadStatus = Uploading (Http.fractionSent p) }, Cmd.none )

                Http.Receiving _ ->
                    ( model, Cmd.none )

        Uploaded result ->
            case result of
                Ok _ ->
                    ( { model | uploadStatus = Ready }, Cmd.none )

                Err e ->
                    let
                        _ =
                            Debug.log "error uploading: " e
                    in
                    ( model, Cmd.none )


viewMediaDialog : Model Msg -> ( Modal.Visibility, String ) -> Html Msg
viewMediaDialog model ( visibility, objectNameorId ) =
    let
        exposition : Exposition.RCExposition Msg
        exposition =
            model.exposition

        object : Exposition.RCMediaObject
        object =
            case Exposition.objectByNameOrId objectNameorId exposition of
                Just obj ->
                    obj

                Nothing ->
                    -- Just for debug:
                    debugObject objectNameorId

        -- How do we get the old and new state of the media object here ?
        viewObjectState : Exposition.RCMediaObjectViewState
        viewObjectState = Exposition.validateMediaObject exposition object object

        mediaEditView =
            RCMediaEdit.view viewObjectState (makeMediaEditMsgs object)
    in
    Modal.config CloseMediaDialog
        |> Modal.small
        |> Modal.hideOnBackdropClick True
        |> Modal.h3 [] [ text "Modal header" ]
        |> Modal.body [] [ p [] [ mediaEditView, text <| "This is a modal for object " ++ objectNameorId ] ]
        |> Modal.footer []
            [ Button.button
                [ Button.outlinePrimary
                , Button.attrs [ onClick CloseMediaDialog ]
                ]
                [ text "Close" ]
            ]
        |> Modal.view visibility


viewUpload : UploadStatus -> Html Msg
viewUpload status =
    case status of
        Ready ->
            button [ onClick UploadMediaFileSelect ] [ text "Upload Media" ]

        Uploading fraction ->
            div [] [ text (String.fromInt (round (100 * fraction)) ++ "%") ]


view : Model Msg -> Html Msg
view model =
    case ( model.research, model.weave ) of
        ( Just r, Just w ) ->
            div []
                [ model.exposition.renderedHtml
                , viewMediaDialog model model.mediaDialog
                , viewUpload model.uploadStatus
                ]

        _ ->
            div []
                [ model.exposition.renderedHtml
                , viewMediaDialog model model.mediaDialog
                , viewUpload model.uploadStatus
                , text "test, No exposition loaded"
                ]
