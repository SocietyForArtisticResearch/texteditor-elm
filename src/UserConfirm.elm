module UserConfirm exposing (ConfirmDialogContent, Messages, view)

import Bootstrap.Button as Button
import Bootstrap.Form as Form
import Bootstrap.Modal as Modal
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)



-- this is a view that can be used to get user confirmation
-- Messages: actions that are taken in response to user feedback


type alias Messages msg =
    { confirm : msg
    , reject : msg
    }



-- text displayed to user


type alias ConfirmDialogContent =
    { prompt : String
    , confirm : String
    , reject : String
    }


view : Modal.Visibility -> ConfirmDialogContent -> Messages msg -> Html msg
view visibility content messages =
    Modal.config messages.reject
        |> Modal.small
        |> Modal.hideOnBackdropClick True
        |> Modal.body [] [ p [] [ text content.prompt ] ]
        |> Modal.footer []
            [ Button.button
                [ Button.outlineDanger
                , Button.attrs [ onClick messages.confirm ]
                ]
                [ text content.confirm ]
            , Button.button
                [ Button.outlineInfo
                , Button.attrs [ onClick messages.reject ]
                ]
                [ text content.reject ]
            ]
        |> Modal.view visibility
