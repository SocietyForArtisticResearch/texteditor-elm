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
import Problems
import RCAPI
import RCMediaEdit
import Regex
import String.Extra as Str


type alias Model msg =
    { exposition : Exposition.RCExposition msg
    , editGeneration : Int
    , mediaDialog : ( Modal.Visibility, String )
    , weave : Int
    , research : Int
    , uploadStatus : UploadStatus
    , problems : List Problems.Problem
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
              , research = fl.research
              , weave = fl.weave
              , uploadStatus = Ready
              , problems = []
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
              , research = -1
              , weave = -1
              , uploadStatus = Ready
              , problems = [ Problems.WrongExpositionUrl ]
              }
            , Cmd.none
            )


addProblem : Model msg -> Problems.Problem -> Model msg
addProblem model problem =
    { model | problems = problem :: model.problems }


addProblems : Model msg -> List Problems.Problem -> Model msg
addProblems model problems =
    { model | problems = problems ++ model.problems }


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
            case exp of
                Ok e ->
                    let
                        _ =
                            Debug.log "loaded exposition: " e
                    in
                    ( { model | exposition = RCAPI.toRCExposition e model.research model.weave }, RCAPI.getMediaList model.research GotMediaList )

                Err err ->
                    let
                        _ =
                            Debug.log "could not load exposition: " err
                    in
                    ( model, Cmd.none )

        GotMediaList mediaResult ->
            case mediaResult of
                Err _ ->
                    ( addProblem model (Problems.CannotLoadMedia "http request failed"), Cmd.none )

                Ok media ->
                    let
                        ( problems, mediaEntries ) =
                            Problems.splitResultList (List.map (RCAPI.toRCMediaObject model.research) media)

                        modelWithProblems =
                            addProblems model problems

                        expositionWithMedia =
                            List.foldr Exposition.addOrReplaceObject modelWithProblems.exposition mediaEntries
                    in
                    ( { modelWithProblems | exposition = expositionWithMedia }, Cmd.none )

        MediaEdit obj ->
            ( { model | exposition = Exposition.replaceObject obj model.exposition }, Cmd.none )

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
            , RCAPI.uploadMedia model.research file (Http.expectWhatever Uploaded)
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
                    let
                        _ =
                            Debug.log "object not found, object name or id =" objectNameorId
                    in
                    debugObject objectNameorId

        -- How do we get the old and new state of the mdei object here ?
        viewObjectState : Exposition.RCMediaObjectViewState
        viewObjectState =
            Exposition.validateMediaObject exposition object object

        mediaEditView =
            RCMediaEdit.view viewObjectState (makeMediaEditMsgs object)
    in
    Modal.config CloseMediaDialog
        |> Modal.small
        |> Modal.hideOnBackdropClick True
        |> Modal.h5 [] [ text <| "Edit object " ++ objectNameorId ]
        |> Modal.body [] [ p [] [ mediaEditView ] ]
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
    div []
        [ model.exposition.renderedHtml
        , viewMediaDialog model model.mediaDialog
        , viewUpload model.uploadStatus
        ]



-- -- for testing only


debugObject : String -> Exposition.RCMediaObject
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



--DEBUG: just to have something to test in an empty
