module RCMediaEdit exposing (Field(..), MediaEditMessage, Model, empty, showWithObject, view)

import Bootstrap.Button as Button
import Bootstrap.CDN as CDN
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Form.Select as Select
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Modal as Modal
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCExposition, RCMediaObject, RCMediaObjectValidation, RCMediaObjectViewState)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events as Events
import Licenses exposing (..)


type Field
    = Name
    | Description
    | UserClass
    | Copyright
    | LicenseField


type alias Model =
    { visibility : Modal.Visibility
    , object : Maybe RCMediaObject
    , objectViewState : Maybe RCMediaObjectViewState
    }


empty : Model
empty =
    { visibility = Modal.hidden
    , object = Nothing
    , objectViewState = Nothing
    }


showWithObject : RCMediaObject -> RCMediaObjectViewState -> Model
showWithObject obj state =
    { visibility = Modal.shown
    , object = Just obj
    , objectViewState = Just state
    }


type alias MediaEditMessage msg =
    Field -> String -> msg


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
-- For custom classes, we could also use "dropdown with addon", see http://elm-bootstrap.info/inputgroup


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


viewLicensePicker : String -> List License -> License -> (String -> msg) -> Html msg
viewLicensePicker id licenseOptions currentSelection editMessage =
    let
        selectItem : License -> Select.Item msg
        selectItem license =
            let
                isSelected =
                    currentSelection == license
            in
            Select.item
                [ value <| asString license
                , selected isSelected
                ]
                [ text <| getDescription license ]
    in
    Select.select
        [ Select.id id
        , Select.attrs [ Events.onInput editMessage ]
        ]
    <|
        List.map selectItem allLicenses


type alias InputWithLabelProperties msg =
    { nodeId : String
    , labeltext : String
    , placeholder : String
    , value : String
    , validation : Result String String
    , onInput : String -> msg
    , help : String
    }



-- text input


viewInputWithLabel : InputWithLabelProperties msg -> Html msg
viewInputWithLabel props =
    let
        ( inputResult, validationFeedback ) =
            case props.validation of
                Ok _ ->
                    ( Input.success, [] )

                Err s ->
                    ( Input.danger, [ text s ] )
    in
    Form.group []
        [ Form.label [ for props.nodeId ] [ text props.labeltext ]
        , Input.text
            [ Input.small
            , inputResult
            , Input.attrs
                [ placeholder props.placeholder
                , value props.value
                , Events.onInput props.onInput
                ]
            ]
        , Form.invalidFeedback [] validationFeedback
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



-- fromValidation : Result String String -> String
-- fromValidation result =
--     case result of
--         Ok userinput ->
--             userinput
--         Err error ->
--             "error!" ++ error


helpFromValidation : Result String String -> String
helpFromValidation result =
    case result of
        Ok _ ->
            "ok"

        Err err ->
            "error: " ++ err


viewThumbnail : String -> String -> Html msg
viewThumbnail url altText =
    div [ class "media" ]
        [ label []
            [ text "preview"
            , img
                [ src url
                , alt <| "image named " ++ altText
                , class "preview-thumbnail"
                ]
                []
            ]
        ]


twoCols : List (Html msg) -> List (Html msg) -> Html msg
twoCols col1 col2 =
    Grid.row []
        [ Grid.col [ Col.sm6 ] col1
        , Grid.col [ Col.sm6 ] col2
        ]


viewBody : RCMediaObjectViewState -> MediaEditMessage msg -> RCMediaObject -> Html msg
viewBody objectState editTool objectInEdit =
    let
        nameProps =
            { nodeId = "name"
            , labeltext = "name"
            , placeholder = ""
            , value = objectInEdit.name
            , validation = objectState.validation.name
            , onInput = editTool Name
            , help = "" --helpFromValidation objectState.validation.name
            }

        descriptionProps =
            { nodeId = "description"
            , labeltext = "description"
            , placeholder = "optional"
            , value = objectInEdit.description
            , validation = objectState.validation.description
            , onInput = editTool Description
            , help = "" --helpFromValidation objectState.validation.description
            }

        copyrightProps =
            { nodeId = "copyright"
            , labeltext = "copyright"
            , placeholder = ""
            , value = objectInEdit.copyright
            , validation = objectState.validation.copyright
            , onInput = editTool Copyright
            , help = "" --helpFromValidation objectState.validation.copyright
            }

        currentClass =
            case objectState.validation.userClass of
                Ok val ->
                    val

                Err _ ->
                    "big"

        currentLicense : License
        currentLicense =
            case objectState.validation.license of
                Ok val ->
                    fromString val

                Err val ->
                    AllRightsReserved

        thumbnailUrl =
            Exposition.thumbUrl objectInEdit
    in
    div [ class "edit-media-dialog" ]
        [ Form.form [] <|
            List.singleton <|
                twoCols
                    [ --viewThumbnail thumbnailUrl (.value descriptionProps)
                      viewInputWithLabel nameProps
                    , Form.group []
                        [ Form.label [ for "classPicker" ] [ text "display size and location" ]
                        , viewClassesPicker "classPicker" cssClasses currentClass (editTool UserClass)
                        ]
                    , viewTextAreaWithLabel descriptionProps
                    ]
                    [ viewInputWithLabel copyrightProps
                    , Form.group []
                        [ Form.label [ for "licensePicker" ] [ text "license type" ]
                        , viewLicensePicker "licensePicker" allLicenses currentLicense (editTool LicenseField)
                        ]
                    ]
        ]


type alias MakeMediaEditFun msg =
    Exposition.RCMediaObject -> Field -> String -> msg


type alias InsertMediaMessage msg =
    Exposition.RCMediaObject -> msg



-- object ObjectId field newValue -> msg


view : MakeMediaEditFun msg -> msg -> InsertMediaMessage msg -> RCExposition -> Model -> Bool -> Html msg
view makeMediaEditFun closeMediaDialogMsg insertMediaMsg exposition model canInsert =
    let
        { visibility, object, objectViewState } =
            model
    in
    case ( visibility, object, objectViewState ) of
        ( vis, Just obj, Just objState ) ->
            let
                mediaEditView =
                    viewBody objState (makeMediaEditFun obj) obj

                insertButton =
                    Button.button
                        [ Button.outlinePrimary
                        , Button.attrs [ Events.onClick <| insertMediaMsg obj ]
                        ]
                        [ text "Insert" ]

                closeButton =
                    Button.button
                        [ Button.outlineSecondary
                        , Button.attrs [ Events.onClick closeMediaDialogMsg ]
                        ]
                        [ text "Close" ]

                buttons =
                    if canInsert then
                        [ insertButton, closeButton ]

                    else
                        [ closeButton ]
            in
            Modal.config closeMediaDialogMsg
                |> Modal.scrollableBody True
                |> Modal.h2 [] [ text <| "Edit " ++ obj.name ]
                |> Modal.large
                |> Modal.hideOnBackdropClick True
                |> Modal.body [] [ p [] [ mediaEditView ] ]
                |> Modal.footer []
                    buttons
                |> Modal.view vis

        _ ->
            div [] []
