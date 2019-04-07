port module Main exposing (Msg(..), main, update, view)

import Browser
import Exposition
import Html exposing (Html, div, span, text)
import Html.Attributes exposing (attribute)
import Html.Events exposing (on, onInput)
import Json.Decode as D
import Json.Encode as E
import Regex
import String.Extra as Str


type alias Model msg =
    { exposition : Exposition.RCExposition msg
    , editGeneration : Int
    }


init : () -> ( Model msg, Cmd Msg )
init _ =
    ( { editGeneration = -1
      , exposition = Exposition.empty
      }
    , Cmd.none
    )


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }


port currentGeneration : (E.Value -> msg) -> Sub msg


port cmContent : (E.Value -> msg) -> Sub msg


port getContent : () -> Cmd msg


subscriptions : Model msg -> Sub Msg
subscriptions model =
    Sub.batch
        [ currentGeneration EditGeneration
        , cmContent MdContent
        ]


type Msg
    = EditGeneration E.Value
    | MdContent E.Value


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


view : Model Msg -> Html Msg
view model =
    div [] [ model.exposition.renderedHtml ]
