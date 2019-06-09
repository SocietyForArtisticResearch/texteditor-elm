module View exposing (Icon(..), mkButton, mkDropdown, renderIcon)

import Bootstrap.Button as Button
import Bootstrap.Dropdown as Dropdown
import Bootstrap.Utilities.Spacing as Spacing
import Html exposing (Html, a, button, div, img, li, p, span, text, ul)
import Html.Attributes exposing (attribute, class, for, href, id, src)
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
    | NoIcon


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


mkButton : Icon -> Bool -> msg -> String -> Html msg
mkButton icon needsOffset onClickMsg buttonText =
    let
        spacing =
            if needsOffset then
                [ Spacing.m1 ]

            else
                []
    in
    Button.button
        [ Button.light
        , Button.attrs <| List.append [ onClick onClickMsg ] spacing
        ]
        [ renderIcon icon
        , text buttonText
        ]


mkDropdown : Dropdown.State -> (Dropdown.State -> msg) -> String -> List ( String, msg ) -> Html msg
mkDropdown modelState openMsg mainTxt itemMsgLst =
    div [ class "d-{inline-block}" ]
        [ Dropdown.dropdown
            modelState
            { options = [ Dropdown.attrs [ Spacing.m1 ] ]
            , toggleMsg = openMsg
            , toggleButton =
                Dropdown.toggle [ Button.light ] [ text mainTxt ]
            , items =
                List.map
                    (\( buttonTxt, clickMsg ) ->
                        Dropdown.buttonItem [ onClick clickMsg ] [ text buttonTxt ]
                    )
                    itemMsgLst
            }
        ]
