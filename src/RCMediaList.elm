module RCMediaList exposing (view)

import Bootstrap.Table as Table
import Bootstrap.Button as Button
import Html exposing (span, Html, text)
import Html.Events exposing (onClick)
import Exposition exposing (RCMediaObject)

type alias TableMessages msg =
   { editTool : Int -> msg } -- integer is object ID

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
                        , Table.th [] [ text "info" ]
                        ]

                rowFromRCObject : RCMediaObject -> Table.Row msg
                rowFromRCObject object =
                    let
                        info =
                            "file url?"

                        editButton =
                            Button.button
                                 [Button.outlinePrimary
                                 ,Button.attrs [onClick <| messages.editTool object.id]
                                 ]
                                 [text "edit"]
                                
                    in
                    Table.tr []
                        [ Table.td [] [ text <| String.fromInt object.id ]
                        , Table.td [] [ text object.name ]
                        , Table.td [] [ editButton ]
                        ]

                rows =
                    List.map rowFromRCObject objectList
            in
            Table.table
                { options = [Table.hover, Table.striped, Table.small]
                , thead = head
                , tbody =
                    Table.tbody [] rows
                }
