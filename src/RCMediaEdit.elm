module RCMediaEdit exposing (DialogType(..), Field(..), MediaEditMessage, Model, Msg(..), empty, showWithObject, update, view)

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
import Json.Decode as Decode
import Licenses exposing (..)
import Problems exposing (..)
import RCMediaPreview
import Settings
import View


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
    , allowInsert : Bool
    }


type DialogType
    = WithInsertButton
    | WithoutInsertButton


type Msg
    = ShowMediaWithId DialogType String



-- extensible record, any model with this RCMediaEdit and an exposition


type alias MediaDialogModel model =
    { model
        | exposition : RCExposition
        , mediaDialog : Model
    }


empty : Model
empty =
    { visibility = Modal.hidden
    , object = Nothing
    , objectViewState = Nothing
    , allowInsert = False
    }


showWithObject : RCMediaObject -> RCMediaObjectViewState -> Bool -> Model
showWithObject obj state allowInsert =
    { visibility = Modal.shown
    , object = Just obj
    , objectViewState = Just state
    , allowInsert = allowInsert
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
    , CssClass "custom1" "custom1"
    , CssClass "custom2" "custom2"
    , CssClass "custom3" "custom3"
    ]



-- Note to self, Select requires some ugly beast to parse the values, unless we do not support IE:
-- https://stackoverflow.com/questions/39371105/how-to-use-select-dropdown-tag-in-elm-lang
-- For custom classes, we could also use "dropdown with addon", see http://elm-bootstrap.info/inputgroup


onChange : (String -> msg) -> Html.Attribute msg
onChange handler =
    let
        _ =
            Debug.log "onChange event" ""
    in
    Events.on "change" (Decode.map handler (Decode.at [ "target", "value" ] Decode.string))


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
        , Select.attrs [ onChange editMessage ]
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
                [ value <| Licenses.asString license
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
    , onSave : String -> msg
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
                , onChange props.onSave
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
                , onChange props.onSave
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


viewBody : RCMediaObjectViewState -> MediaEditMessage msg -> MediaEditMessage msg -> RCMediaObject -> Html msg
viewBody objectState inputFun saveFun objectInEdit =
    let
        nameProps =
            { nodeId = "name"
            , labeltext = "name"
            , placeholder = ""
            , value = objectInEdit.name
            , validation = objectState.validation.name
            , onInput = inputFun Name
            , onSave = saveFun Name
            , help = "" --helpFromValidation objectState.validation.name
            }

        descriptionProps =
            { nodeId = "description"
            , labeltext = "description"
            , placeholder = "optional"
            , value = objectInEdit.description
            , validation = objectState.validation.description
            , onInput = inputFun Description
            , onSave = saveFun Description
            , help = "" --helpFromValidation objectState.validation.description
            }

        copyrightProps =
            { nodeId = "copyright"
            , labeltext = "copyright"
            , placeholder = ""
            , value = objectInEdit.copyright
            , validation = objectState.validation.copyright
            , onInput = inputFun Copyright
            , onSave = saveFun Copyright
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
                    Licenses.defaultLicense

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
                        , viewClassesPicker "classPicker" cssClasses currentClass (saveFun UserClass)
                        , p [ class "css-class-name", title "CSS class name for this object" ] [ text <| cssClassFromObject objectInEdit ]
                        ]
                    , viewTextAreaWithLabel descriptionProps
                    ]
                    [ viewInputWithLabel copyrightProps
                    , Form.group []
                        [ Form.label [ for "licensePicker" ]
                            [ text "license type"
                            , a
                                [ style "color" "rgb(153,153,153)"
                                , style "margin-left" "0.25em"
                                , href "https://guide.researchcatalogue.net/#licenses"
                                , title "more info about choosing a license"
                                , target "_blank"
                                ]
                                [ text "(?)" ]
                            ]
                        , viewLicensePicker "licensePicker" allLicenses currentLicense (saveFun LicenseField)
                        ]
                    , RCMediaPreview.viewThumbnail objectInEdit RCMediaPreview.PreviewBig
                    ]
        ]


type alias MakeMediaEditFun msg =
    Exposition.RCMediaObject -> Field -> String -> msg


type alias InsertMediaMessage msg =
    Exposition.RCMediaObject -> msg


type alias InsertMediaAsLinkMessage msg =
    Exposition.RCMediaObject -> msg


update : MediaDialogModel (Problemized model) -> Msg -> MediaDialogModel (Problemized model)
update model message =
    case message of
        ShowMediaWithId dialogType mediaNameOrId ->
            case Exposition.objectByNameOrId mediaNameOrId model.exposition of
                Just obj ->
                    let
                        viewObjectState =
                            Exposition.validateMediaObject model.exposition obj obj

                        showInsert =
                            case dialogType of
                                WithInsertButton ->
                                    True

                                WithoutInsertButton ->
                                    False
                    in
                    { model
                        | mediaDialog =
                            showWithObject obj viewObjectState showInsert
                    }

                Nothing ->
                    let
                        modelWithProblem =
                            Problems.addProblem model <| Problems.NoMediaWithNameOrId mediaNameOrId
                    in
                    { modelWithProblem
                        | mediaDialog = empty
                    }



-- object ObjectId field newValue -> msg


cssClassFromObject : RCMediaObject -> String
cssClassFromObject obj =
    ".rc-media-" ++ String.fromInt obj.id


view : Settings.BuildType -> MakeMediaEditFun msg -> MakeMediaEditFun msg -> msg -> InsertMediaMessage msg -> InsertMediaAsLinkMessage msg -> RCExposition -> Model -> Html msg
view buildTarget makeMediaInputFun makeMediaEditFun closeMediaDialogMsg insertMediaMsg insertMediaAsLinkMsg exposition model =
    let
        { visibility, object, objectViewState, allowInsert } =
            model

        emptyDiv =
            div [] []
    in
    case object of
        Just obj ->
            case objectViewState of
                Just objViewState ->
                    let
                        mediaEditView =
                            viewBody objViewState (makeMediaInputFun obj) (makeMediaEditFun obj) obj

                        defaultBut =
                            View.defaultButton (insertMediaAsLinkMsg obj)

                        {- insertLinkButton : Html msg
                           insertLinkButton =
                               View.mkButton buildTarget
                                   { defaultBut
                                       | icon = View.HyperlinkIcon
                                       , text = ""
                                       , title = "insert as hyperlink"
                                   }
                        -}
                        insertButton =
                            Button.button
                                [ Button.primary
                                , Button.attrs [ Events.onClick <| insertMediaMsg obj ]
                                ]
                                [ text "Insert" ]

                        closeButton =
                            Button.button
                                [ Button.outlineSecondary
                                , Button.attrs [ Events.onClick closeMediaDialogMsg ]
                                ]
                                [ text "Done" ]

                        buttons =
                            if allowInsert then
                                [ --insertLinkButton
                                  insertButton
                                , closeButton
                                ]

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
                        |> Modal.view visibility

                _ ->
                    emptyDiv

        _ ->
            emptyDiv
