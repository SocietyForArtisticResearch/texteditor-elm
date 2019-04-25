module RCMediaEdit exposing (view)

import Bootstrap.CDN as CDN
import Bootstrap.Form
import Bootstrap.Form.Input as Input
import Bootstrap.Form.Select as Select
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Exposition exposing (RCExposition, RCMediaObject)
import Html exposing (..)
import Html.Attributes exposing (..)


type Field
    = Name
    | Description
    | StylingClass
    | Copyright
    | File


type alias MediaEditMessages msg =
    { insertTool : msg
    , editTool : RCMediaObject -> msg
    , deleteTool : RCMediaObject -> msg
    }


type alias CssClass =
    { selector : String
    , name : String
    }


type alias RCMediaObjectValidation =
    { name : Result String String
    , description : Result String String
    , copyright : Result String String
    , file : Result String String
    , cssClass : Result String String
    }



-- presets for the user to use:


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


viewClassesPicker : String -> List CssClass -> CssClass -> Html Msg
viewClassesPicker id classList currentSelection =
    let
        selectItem : CssClass -> Html Msg
        selectItem item =
            let
                isSelected =
                    currentSelection.selector == selectItem
            in
            Select.item
                [ Select.value item.selector
                , Html.Attributes.Selected isSelected
                ]
                [ text item.name ]
    in
    Select.select [ Select.id id ] <|
        List.map selectItem classList


type alias InputWithLabelProperties =
    { nodeId : String
    , labeltext : String
    , placeholder : String
    , value : String
    , onInput : String -> msg
    , help : String
    }



-- text input


viewInputWithLabel : InputWithLabelProperties -> Html msg
viewInputWithLabel props =
    Form.group []
        [ Form.label [ for props.id ] [ text props.labeltext ]
        , Input.text [ placeholder props.placeholder, value props.value ] []
        , Form.help [] [ text props.help ]
        ]



-- textarea input


viewTextAreaWithLabel : InputWithLabelProperties -> Html msg
viewTextAreaWithLabel props =
    Form.group []
        [ label [ for props.id ] [ text props.labeltext ]
        , Textarea.textarea
            [ Textarea.id props.id
            , Textarea.rows
            , value props.value
            ]
            []
        ]


fromValidation : Result String String -> String
fromValidation result =
    case result of
        Ok result ->
            result

        Err error ->
            "error: " ++ error


view : RCMediaObjectViewState -> MediaEditMesages -> Html msg
view objectState messages =
    let
        nameProps =
            { nodeId = "name"
            , labeltext = "name"
            , placeholder = ""
            , value = fromValidation objectState.validation.name
            , onInput = messages.editTool
            }

        descriptionProps =
            { nodeId = "description"
            , labeltext = "description"
            , placeholder = "optional"
            , value = fromValidation objectState.validation.description
            , onInput = message.editTool
            }

        copyrightProps =
            { nodeId = "copyright"
            , labeltext = "copyright"
            , placeholder = ""
            , value = fromValidation objectState.validation.copyright
            , onInput = message.editTool
            }
    in
    div []
        [ p [ text "media object" ++ String.fromInt MediaObjectID ] []
        , Form.form []
            [ viewInputWitLabel nameProps
            , viewInputWithLabel descriptionProps
            , Form.group []
                [ Form.label [ for "classPicker" ] [ text "How should the media be displayed" ]
                , viewClassesPicker "classPicker" cssClasses
                ]
            , viewTextAreaWithLabel descriptionProps
            , Button.button [ Button.primary, onClick remove ] [ text "Insert" ]
            , Button.button [ Button.primary, onClick edit ] [ text "Remove" ]
            ]
        ]
