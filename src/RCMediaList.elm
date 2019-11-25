module RCMediaList exposing
    ( Model
    , Msg(..)
    , PickerMessages
    , TableEditMessages
    , TableMessage(..)
    , empty
    , update
    , view
    , viewModalMediaPicker
    )

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Bootstrap.Table as BTable
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCMediaObject)
import Html exposing (Html, audio, div, img, input, source, span, text, video)
import Html.Attributes exposing (autoplay, class, controls, id, loop, placeholder, src, style, title, type_)
import Html.Events exposing (onClick, onDoubleClick, onInput)
import RCMediaPreview exposing (PreviewSize(..), viewThumbnail)
import Reader exposing (Reader, andThen, ask, reader, run)
import Table
import View exposing (defaultButton, mkButton)


type alias TableEditMessages msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    }


type alias PickerMessages msg =
    { insertObject : RCMediaObject -> msg
    , closeModal : msg
    , uploadMediaFileSelect : msg
    }


type Msg msg
    = SortableTableMessage TableMessage
    | EditMediaMessage msg


type TableMessage
    = SetQuery String
    | SetTableState Table.State


type alias Model =
    { query : String
    , state : Table.State
    }


type alias ObjectAndActions msg =
    { actions : TableEditMessages msg
    , object : RCMediaObject
    }


empty : Model
empty =
    { query = ""
    , state = Table.initialSort "ID"
    }


config : TableEditMessages msg -> Table.Config RCMediaObject (Msg msg)
config messages =
    let
        makeMsg : Table.State -> Msg msg
        makeMsg state =
            (SortableTableMessage << SetTableState) <| state
    in
    Table.config
        { toId = String.fromInt << .id
        , toMsg = makeMsg
        , columns =
            [ thumbnailColumn
            , Table.stringColumn "ID" (String.fromInt << .id)
            , Table.stringColumn "Name" .name
            , buttonColumn messages
            ]
        }


thumbnailColumn : Table.Column RCMediaObject (Msg msg)
thumbnailColumn =
    Table.veryCustomColumn
        { name = ""
        , viewData = \rcObject -> Table.HtmlDetails [] [ viewThumbnail rcObject PreviewSmall ]
        , sorter = Table.unsortable
        }


editButton : TableEditMessages msg -> RCMediaObject -> Html (Msg msg)
editButton messages object =
    let
        makeEditMessage =
            EditMediaMessage << messages.editObject << String.fromInt << .id
    in
    Button.button
        [ Button.small
        , Button.outlineSecondary
        , Button.attrs [ Spacing.ml1, onClick <| makeEditMessage object ]
        ]
        [ text "Edit" ]


deleteButton : TableEditMessages msg -> RCMediaObject -> Html (Msg msg)
deleteButton messages object =
    let
        makeDeleteMessage =
            EditMediaMessage << messages.deleteObject
    in
    Button.button
        [ Button.small
        , Button.outlineSecondary
        , Button.attrs [ Spacing.ml1, onClick <| makeDeleteMessage object ]
        ]
        [ text "Delete" ]


buttonColumn : TableEditMessages msg -> Table.Column RCMediaObject (Msg msg)
buttonColumn messages =
    Table.veryCustomColumn
        { name = ""
        , viewData = viewObjectButtons messages
        , sorter = Table.unsortable
        }


viewObjectButtons : TableEditMessages msg -> RCMediaObject -> Table.HtmlDetails (Msg msg)
viewObjectButtons messages object =
    Table.HtmlDetails []
        [{--editButton messages object
        , deleteButton messages object --}
        ]


update : TableMessage -> Model -> Model
update message model =
    case message of
        SetQuery string ->
            { model | query = string }

        SetTableState state ->
            { model | state = state }


filterObjectsByName : String -> List RCMediaObject -> List RCMediaObject
filterObjectsByName query lst =
    case query of
        "" ->
            lst

        q ->
            let
                lowerQuery =
                    String.toLower q
            in
            List.filter (String.contains lowerQuery << String.toLower << .name) lst


view : Model -> List RCMediaObject -> TableEditMessages msg -> Html (Msg msg)
view { query, state } objectList messages =
    case objectList of
        [] ->
            div [ class "media-list", style "display" "none" ]
                [ Alert.simpleInfo [] [ text "Media list is empty. Hint: add a file by using the \"upload media\" button." ]
                ]

        nonEmptyObjectList ->
            let
                searchedObjects =
                    filterObjectsByName query nonEmptyObjectList

                inputHandler : String -> Msg msg
                inputHandler qstring =
                    SortableTableMessage (SetQuery qstring)
            in
            case searchedObjects of
                [] ->
                    div
                        [ class "media-list", style "display" "none" ]
                        [ Alert.simpleInfo [] [ text <| "Cannot find any media named \"" ++ query ++ "\"" ] ]

                results ->
                    div [ id "media-list", style "display" "none" ]
                        [ input [ placeholder "Search by name", onInput inputHandler ] []
                        , Table.view (config messages) state results
                        ]



{- OLD CODE
   view : Model -> List RCMediaObject -> TableMessages msg -> Html (Msg msg)
   view objectList messages =
       case objectList of
           [] ->
               div [ class "media-list", style "display" "none" ]
                   [ Alert.simpleInfo [] [ text "There are no objects yet. Hint: add a file by using the \"upload media\" button." ]
                   ]

           _ ->
               let
                   head =
                       BTable.simpleThead
                           [ BTable.th [] [ text "Preview" ]
                           , BTable.th [] [ text "Id" ]
                           , BTable.th [] [ text "Name" ]
                           , BTable.th
                               [ BTable.cellAttr <| class "edit-button-column"
                               ]
                               [ text "Edit" ]
                           ]

                   rowFromRCObject : RCMediaObject -> BTable.Row msg
                   rowFromRCObject object =
                       let
                           editButton =
                               Button.button
                                   [ Button.small
                                   , Button.outlineSecondary
                                   , Button.attrs [ Spacing.ml1, onClick <| messages.editObject (String.fromInt object.id) ]
                                   ]
                                   [ text "Edit" ]

                           -- insertButton =
                           --     Button.button
                           --         [ Button.small
                           --         , Button.outlineSuccess
                           --         , Button.attrs [ Spacing.ml1, onClick <| messages.insertObject object ]
                           --         ]
                           --         [ text "insert" ]
                           removeButton =
                               Button.button
                                   [ Button.small
                                   , Button.outlineDanger
                                   , Button.attrs [ Spacing.ml1, onClick <| messages.deleteObject object ]
                                   ]
                                   [ text "Delete" ]
                       in
                       BTable.tr [ BTable.rowAttr <| onDoubleClick <| messages.editObject (String.fromInt object.id) ]
                           [ BTable.td [] [ viewThumbnail object PreviewSmall ]
                           , BTable.td [] [ text <| String.fromInt object.id ]
                           , BTable.td [] [ text object.name ]
                           , BTable.td [] [ editButton, removeButton ]
                           ]

                   rows =
                       List.map rowFromRCObject objectList
               in
               div [ id "media-list", style "display" "none" ]
                   [ BTable.table
                       { options = [ BTable.hover, BTable.striped, BTable.small ]
                       , thead = head
                       , tbody =
                           BTable.tbody [] rows
                       }
                   ]
-}


viewModalMediaPicker : Modal.Visibility -> List RCMediaObject -> PickerMessages msg -> Html msg
viewModalMediaPicker visibility objectList messages =
    let
        tableList =
            case objectList of
                [] ->
                    Alert.simpleInfo [] [ text "There are no objects yet, add by using the \"upload media\" button." ]

                _ ->
                    let
                        head =
                            BTable.simpleThead
                                [ BTable.th [] [ text "Preview" ]
                                , BTable.th [] [ text "Id" ]
                                , BTable.th [] [ text "Name" ]
                                , BTable.th [] [ text "Insert" ]
                                ]

                        rowFromRCObject : RCMediaObject -> BTable.Row msg
                        rowFromRCObject object =
                            let
                                insertButton =
                                    Button.button
                                        [ Button.small
                                        , Button.outlineSuccess
                                        , Button.attrs [ Spacing.ml1, onClick <| messages.insertObject object ]
                                        ]
                                        [ text "Insert" ]
                            in
                            BTable.tr [ BTable.rowAttr <| onDoubleClick <| messages.insertObject object ]
                                [ BTable.td [] [ viewThumbnail object PreviewSmall ]
                                , BTable.td [] [ text <| String.fromInt object.id ]
                                , BTable.td [] [ text object.name ]
                                , BTable.td [] [ insertButton ]
                                ]

                        rows =
                            List.map rowFromRCObject objectList

                        uploadButton =
                            defaultButton messages.uploadMediaFileSelect
                    in
                    div []
                        [ mkButton
                            { uploadButton
                                | icon = View.UploadCloud
                                , offset = False
                                , title = "Add video, audio, pdf or images files"
                                , text = "Upload Media"
                                , primary = False
                            }
                        , BTable.table
                            { options = [ BTable.hover, BTable.striped, BTable.small ]
                            , thead = head
                            , tbody =
                                BTable.tbody [] rows
                            }
                        ]
    in
    Modal.config messages.closeModal
        |> Modal.scrollableBody True
        |> Modal.large
        |> Modal.hideOnBackdropClick True
        |> Modal.h1 [] [ text "Select a media object to insert." ]
        |> Modal.body [] [ tableList ]
        |> Modal.footer []
            [ Button.button
                [ Button.secondary, Button.attrs [ onClick messages.closeModal ] ]
                [ text "Cancel" ]
            ]
        |> Modal.view visibility
