module RCMediaList exposing (TableMessages, view)

import Bootstrap.Button as Button
import Bootstrap.Table as Table
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCMediaObject)
import Html exposing (Html, span, text)
import Html.Events exposing (onClick)


type alias TableMessages msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    }



-- integer is object ID


view : List RCMediaObject -> TableMessages msg -> Html msg
view objectList messages =
    case objectList of
        [] ->
            span [] [ text "no objects" ]

        _ ->
            let
                head =
                    Table.simpleThead
                        [ Table.th [] [ text "id" ]
                        , Table.th [] [ text "name" ]
                        , Table.th [] [ text "edit" ]
                        ]

                rowFromRCObject : RCMediaObject -> Table.Row msg
                rowFromRCObject object =
                    let
                        editButton =
                            Button.button
                                [ Button.small
                                , Button.outlineInfo
                                , Button.attrs [ onClick <| messages.editObject (String.fromInt object.id) ]
                                ]
                                [ text "edit" ]

                        insertButton =
                            Button.button
                                [ Button.small
                                , Button.outlineWarning
                                , Button.attrs [ Spacing.ml1, onClick <| messages.insertObject object ]
                                ]
                                [ text "insert" ]

                        removeButton =
                            Button.button
                                [ Button.small
                                , Button.outlineDanger
                                , Button.attrs [ Spacing.ml1, onClick <| messages.deleteObject object ]
                                ]
                                [ text "x" ]
                    in
                    Table.tr []
                        [ Table.td [] [ text <| String.fromInt object.id ]
                        , Table.td [] [ text object.name ]
                        , Table.td [] [ editButton, insertButton, removeButton ]
                        ]

                rows =
                    List.map rowFromRCObject objectList
            in
            Table.table
                { options = [ Table.hover, Table.striped, Table.small ]
                , thead = head
                , tbody =
                    Table.tbody [] rows
                }
