module View exposing (ButtonInfo, Icon(..), defaultButton, mkButton, mkDropdown, optionalBlock, renderIcon)

import Bootstrap.Button as Button
import Bootstrap.Dropdown as Dropdown
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (Html, a, button, div, img, li, p, span, text, ul)
import Html.Attributes exposing (attribute, class, for, href, id, src, style, title)
import Html.Events exposing (on, onCheck, onClick, onInput)
import Settings exposing (iconUrl)


type Icon
    = PlusIcon
    | ImportIcon
    | SaveIcon
    | ItalicIcon
    | LinkIcon
    | BoldIcon
    | QuoteIcon
    | HeaderIcon
    | ListIcon
    | NumberedIcon
    | ArrowDown
    | UploadCloud
    | EyeIcon
    | NoIcon
    | UndoIcon
    | RedoIcon
    | FullScreenIcon
    | NormalScreenIcon
    | MediaIcon


renderIcon : Icon -> Html msg
renderIcon icon =
    let
        iconImg url =
            img
                [ src (iconUrl ++ url)
                , class "m-1"
                , Html.Attributes.width 15
                , Html.Attributes.height 15
                , Html.Attributes.style "position" "relative"
                , Html.Attributes.style "top" "-2px"
                ]
                []
    in
    case icon of
        NoIcon ->
            div [] []

        PlusIcon ->
            iconImg "plus.svg"

        ImportIcon ->
            iconImg "import-export.svg"

        SaveIcon ->
            iconImg "save.svg"

        ItalicIcon ->
            iconImg "italic.svg"

        LinkIcon ->
            iconImg "link-intact.svg"

        BoldIcon ->
            iconImg "bold.svg"

        ListIcon ->
            iconImg "list-unordered.svg"

        NumberedIcon ->
            iconImg "list-ordered.svg"

        HeaderIcon ->
            iconImg "header.svg"

        QuoteIcon ->
            iconImg "double-quote-sans-left.svg"

        ArrowDown ->
            iconImg "arrow-down.svg"

        UploadCloud ->
            iconImg "cloud-upload.svg"

        EyeIcon ->
            iconImg "eye.svg"

        UndoIcon ->
            iconImg "undo.svg"

        RedoIcon ->
            iconImg "redo.svg"

        FullScreenIcon ->
            iconImg "screen-full.svg"

        NormalScreenIcon ->
            iconImg "screen-normal.svg"

        MediaIcon ->
            iconImg "file-media.svg"


type alias ButtonInfo msg =
    { icon : Icon
    , offset : Bool
    , onClickMsg : msg
    , text : String
    , primary : Bool
    , otherAttrs : List (Html.Attribute msg)
    , hidden : Bool
    , title : String
    }


defaultButton : msg -> ButtonInfo msg
defaultButton message =
    { icon = NoIcon
    , offset = False
    , onClickMsg = message
    , text = ""
    , primary = False
    , otherAttrs = []
    , hidden = False
    , title = "button"
    }


mkButton : ButtonInfo msg -> Html msg
mkButton props =
    let
        spacing =
            if props.offset then
                [ Spacing.m1 ]

            else
                []
    in
    Button.button
        [ if props.primary then
            Button.outlineDark

          else
            Button.light
        , Button.attrs <|
            List.append
                [ onClick props.onClickMsg
                , style "display" <|
                    if props.hidden then
                        "none"

                    else
                        "inline-block"
                , title props.title
                ]
                (List.append spacing props.otherAttrs)
        ]
        [ renderIcon props.icon
        , text props.text
        ]


mkDropdown : Dropdown.State -> (Dropdown.State -> msg) -> String -> List ( String, msg ) -> Html msg
mkDropdown modelState openMsg mainTxt itemMsgLst =
    div [ class "d-inline-block" ]
        [ Dropdown.dropdown
            modelState
            { options = [ Dropdown.attrs [ Spacing.m1 ] ]
            , toggleMsg = openMsg
            , toggleButton =
                Dropdown.toggle [ Button.outlineDark ] [ text mainTxt ]
            , items =
                List.map
                    (\( buttonTxt, clickMsg ) ->
                        Dropdown.buttonItem [ onClick clickMsg ] [ text buttonTxt ]
                    )
                    itemMsgLst
            }
        ]


optionalBlock : Bool -> Html msg -> Html msg
optionalBlock show elem =
    div
        [ style "display" <|
            if show then
                "inline-block"

            else
                "none"
        ]
        [ elem
        ]
