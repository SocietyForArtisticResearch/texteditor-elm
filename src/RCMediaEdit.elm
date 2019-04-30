module RCMediaEdit exposing (Field(..), MediaEditMessages, view)

import Bootstrap.Button as Button
import Bootstrap.CDN as CDN
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Form.Select as Select
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Bootstrap.Utilities.Spacing as Spacing 
import Exposition exposing (RCExposition, RCMediaObject, RCMediaObjectValidation, RCMediaObjectViewState)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events as Events


type Field
    = Name
    | Description
    | UserClass
    | Copyright



-- luc: file needs to updated differently?
--    | File


type alias MediaEditMessages msg =
    { insertTool : msg
    , editTool : Field -> String -> msg
    , deleteTool : msg
    }


type alias CssClass =
    { selector : String
    , name : String
    }



-- css class presets


cssClasses : List CssClass
cssClasses =
    [ CssClass "big" "big"
    , CssClass "medium" "medium"
    , CssClass "small" "small"
    , CssClass "floatLeftSmall" "small & float left"
    , CssClass "floatRightSmall" "small & float right"
    , CssClass "floatRightMedium" "medium & float right"
    , CssClass "floatLeftMedium" "medium & float left"
    ]



-- Note to self, Select requires some ugly beast to parse the values, unless we do not support IE:
-- https://stackoverflow.com/questions/39371105/how-to-use-select-dropdown-tag-in-elm-lang


viewClassesPicker : String -> List CssClass -> String -> (String -> msg) -> Html msg
viewClassesPicker id classList currentSelection editMessage =
    let
        selectItem : CssClass -> Select.Item msg
        selectItem item =
            let
                isSelected =
                    currentSelection == item.selector
            in
            Select.item
                [ value item.selector
                , selected isSelected
                ]
                [ text item.name ]
    in
    Select.select
        [ Select.id id
        , Select.attrs [ Events.onInput editMessage ]
        ]
    <|
        List.map selectItem classList


type alias InputWithLabelProperties msg =
    { nodeId : String
    , labeltext : String
    , placeholder : String
    , value : String
    , onInput : String -> msg
    , help : String
    }



-- text input


viewInputWithLabel : InputWithLabelProperties msg -> Html msg
viewInputWithLabel props =
    Form.group []
        [ Form.label [ for props.nodeId ] [ text props.labeltext ]
        , Input.text
            [ Input.attrs
                [ placeholder props.placeholder
                , value props.value
                , Events.onInput props.onInput
                ]
            ]
        , Form.help [] [ text props.help ]
        ]



-- textarea input


viewTextAreaWithLabel : InputWithLabelProperties msg -> Html msg
viewTextAreaWithLabel props =
    Form.group []
        [ label [ for props.nodeId ] [ text props.labeltext ]
        , Textarea.textarea
            [ Textarea.id props.nodeId
            , Textarea.rows 7
            , Textarea.attrs
                [ value props.value
                , Events.onInput props.onInput
                ]
            ]
        ]


fromValidation : Result String String -> String
fromValidation result =
    case result of
        Ok userinput ->
            userinput

        Err error ->
            "error!" ++ error


helpFromValidation : Result String String -> String
helpFromValidation result =
    case result of
        Ok _ ->
            "ok"

        Err err ->
            "error: " ++ err


view : RCMediaObjectViewState -> MediaEditMessages msg -> Html msg
view objectState messages =
    let
        nameProps =
            { nodeId = "name"
            , labeltext = "name"
            , placeholder = ""
            , value = fromValidation objectState.validation.name
            , onInput = messages.editTool Name
            , help = helpFromValidation objectState.validation.name
            }

        descriptionProps =
            { nodeId = "description"
            , labeltext = "description"
            , placeholder = "optional"
            , value = fromValidation objectState.validation.description
            , onInput = messages.editTool Description
            , help = helpFromValidation objectState.validation.description
            }

        copyrightProps =
            { nodeId = "copyright"
            , labeltext = "copyright"
            , placeholder = ""
            , value = fromValidation objectState.validation.copyright
            , onInput = messages.editTool Copyright
            , help = helpFromValidation objectState.validation.copyright
            }

        currentClass =
            case objectState.validation.userClass of
                Ok val ->
                    val

                Err _ ->
                    "big"
    in
    div []
        [ Form.form []
            [ viewInputWithLabel nameProps
            , Form.group []
                [ Form.label [ for "classPicker" ] [ text "How should the media be displayed" ]
                , viewClassesPicker "classPicker" cssClasses currentClass (messages.editTool UserClass)
                ]
            , viewTextAreaWithLabel descriptionProps
            , viewInputWithLabel copyrightProps
            , Form.group []
                [ Button.button
                    [ Button.primary
                    , Button.attrs [ Events.onClick messages.insertTool ]
                    ]
                    [ text "Insert" ]
                , Button.button
                    [ Button.danger
                    , Button.attrs [ Events.onClick messages.deleteTool, Spacing.ml1  ]
                    ]
                    [ text "Remove" ]
                ]
            ]
        ]
