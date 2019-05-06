module RCMediaList exposing (view)

import Bootstrap.Table as Table
import Html exposing (span, Html, text)
import Exposition exposing (RCMediaObject)


view : List RCMediaObject -> Html msg
view objectList =
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
                    in
                    Table.tr []
                        [ Table.td [] [ text <| String.fromInt object.id ]
                        , Table.td [] [ text object.name ]
                        , Table.td [] [ text info ]
                        ]

                rows =
                    List.map rowFromRCObject objectList
            in
            Table.table
                { options = []
                , thead = head
                , tbody =
                    Table.tbody [] rows
                }
