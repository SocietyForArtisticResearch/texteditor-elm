module RCMediaList exposing (TableMessages, view)

import Bootstrap.Button as Button
import Bootstrap.Table as Table
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
                                [ Button.outlineInfo
                                , Button.attrs [ onClick <| messages.editObject (String.fromInt object.id) ]
                                ]
                                [ text "edit" ]

                        insertButton =
                            Button.button
                                [ Button.outlineWarning
                                , Button.attrs [ onClick <| messages.insertObject object ]
                                ]
                                [ text "insert" ]

                        removeButton =
                            Button.button
                                [ Button.outlineDanger
                                , Button.attrs [ onClick <| messages.deleteObject object ]
                                ]
                                [ text "X" ]
                    in
                    Table.tr []
                        [ Table.td [] [ text <| String.fromInt object.id ]
                        , Table.td [] [ text object.name ]
                        , Table.td [] [ editButton ]
                        , Table.td [] [ insertButton ]
                        , Table.td [] [ removeButton ]
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
