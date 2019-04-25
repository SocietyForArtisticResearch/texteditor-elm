port module Main exposing (Msg(..), main, update, view)

import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Browser
import Dict
import Exposition
import Html exposing (Html, div, p, span, text)
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
    }


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
              }
            , Cmd.none
            )


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
        ]


type Msg
    = EditGeneration E.Value
    | MdContent E.Value
    | MediaDialog E.Value
    | MediaEdit Exposition.RCMediaObject
    | MediaDelete Exposition.RCMediaObject
    | MediaReplace Exposition.RCMediaObject
    | InsertTool Exposition.RCMediaObject
    | CloseMediaDialog
    | GotExposition (Result Http.Error (Dict.Dict String String))



-- not yet validated, only update request


makeMediaEditFun : Model msg -> RCMediaObject -> RCMediaEdit.Field -> String -> msg
makeMediaEditFun model obj field input =
    MediaEdit updatedObj


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
            let
                _ =
                    Debug.log "gotexposition" exp
            in
            ( model, Cmd.none )


viewMediaDialog : ( Modal.Visibility, String ) -> Html Msg
viewMediaDialog ( visibility, objectNameorId ) =
    Modal.config CloseMediaDialog
        |> Modal.small
        |> Modal.hideOnBackdropClick True
        |> Modal.h3 [] [ text "Modal header" ]
        |> Modal.body [] [ p [] [ text <| "This is a modal for object " ++ objectNameorId ] ]
        |> Modal.footer []
            [ Button.button
                [ Button.outlinePrimary
                , Button.attrs [ onClick CloseMediaDialog ]
                ]
                [ text "Close" ]
            ]
        |> Modal.view visibility


view : Model Msg -> Html Msg
view model =
    case ( model.research, model.weave ) of
        ( Just r, Just w ) ->
            div [] [ model.exposition.renderedHtml, viewMediaDialog model.mediaDialog ]

        _ ->
            div [] [ text "No exposition loaded" ]
