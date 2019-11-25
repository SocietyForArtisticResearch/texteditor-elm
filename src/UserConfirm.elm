module UserConfirm exposing (Actions, ConfirmDialogContent, Model, empty, view)

import Bootstrap.Button as Button
import Bootstrap.Form as Form
import Bootstrap.Modal as Modal
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)



-- this is a view that can be used to get user confirmation
-- Messages: actions that are taken in response to user feedback


type alias Actions msg =
    { confirm : msg
    , reject : msg
    }



-- text displayed to use


type alias Model msg =
    { visibility : Modal.Visibility
    , content : Maybe ConfirmDialogContent
    , actions : Maybe (Actions msg)
    }


type alias ConfirmDialogContent =
    { prompt : String
    , confirm : String
    , reject : String
    }


empty =
    { visibility = Modal.hidden
    , content = Nothing
    , actions = Nothing
    }


view : Model msg -> Html msg
view { visibility, content, actions } =
    case ( visibility, content, actions ) of
        ( vis, Just content_, Just actions_ ) ->
            Modal.config actions_.reject
                |> Modal.small
                |> Modal.hideOnBackdropClick True
                |> Modal.body [] [ p [] [ text content_.prompt ] ]
                |> Modal.footer []
                    [ Button.button
                        [ Button.danger
                        , Button.attrs [ onClick actions_.confirm ]
                        ]
                        [ text content_.confirm ]
                    , Button.button
                        [ Button.secondary
                        , Button.attrs [ onClick actions_.reject ]
                        ]
                        [ text content_.reject ]
                    ]
                |> Modal.view vis

        -- nothing in, nothing out
        ( _, _, _ ) ->
            div [] []
