module UserConfirm exposing (ConfirmDialogContent, Messages, view)

import Bootstrap.Button as Button
import Bootstrap.Form as Form
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)



-- this is a view that can be used to get user confirmation


type alias Messages msg =
    { confirm : msg
    , reject : msg
    }


type alias ConfirmDialogContent =
    { prompt : String
    , confirm : String
    , reject : String
    }


view : ConfirmDialogContent -> Messages msg -> Html msg
view dialogText messages =
    Form.form []
        [ Form.group []
            [ Form.label
                [ for "confirmButtons" ]
                [ text dialogText.prompt ]
            , Form.group [ Form.attrs [ id "confirmButtons" ] ]
                [ Button.button
                    [ Button.outlinePrimary
                    , Button.attrs [ onClick messages.confirm ]
                    ]
                    [ text dialogText.confirm ]
                , Button.button
                    [ Button.outlineSecondary
                    , Button.attrs
                        [ onClick messages.reject
                        , Spacing.ml1
                        ]
                    ]
                    [ text dialogText.reject ]
                ]
            ]
        ]
