module RCMD exposing (rcToHtml)

import Html exposing (Html, div)
import Markdown.Block as Block exposing (Block(..))
import Markdown.Inline as Inline exposing (Inline(..))
import Regex


type RCMedia
    = RCMedia String


matchRCMedia : String -> Maybe String
matchRCMedia str =
    let
        r =
            Regex.fromString "!{([^}]*)}"
    in
    case r of
        Nothing ->
            Nothing

        Just regexp ->
            let
                matches =
                    Regex.find regexp str
            in
            case matches of
                [] ->
                    Nothing

                m :: _ ->
                    case m.submatches of
                        (Just name) :: _ ->
                            Just name

                        _ ->
                            Nothing


rcMediaText : Inline RCMedia -> Inline RCMedia
rcMediaText inline =
    case inline of
        Text str ->
            case matchRCMedia str of
                Nothing ->
                    Text str

                Just media ->
                    Inline.Custom (RCMedia media) []

        _ ->
            inline


rcInlineView : (String -> Html msg) -> Inline RCMedia -> Html msg
rcInlineView htmlFun inline =
    case inline of
        Inline.Custom (RCMedia str) _ ->
            htmlFun str

        _ ->
            Inline.defaultHtml (Just (rcInlineView htmlFun)) inline


rcBlockView : (String -> Html msg) -> Block b RCMedia -> List (Html msg)
rcBlockView htmlFun block =
    Block.defaultHtml
        Nothing
        -- using Block.defaultHtml to render the inner blocks
        (Just (rcInlineView htmlFun))
        block


rcToHtml : (String -> Html msg) -> String -> Html msg
rcToHtml htmlFun str =
    str
        |> Block.parse Nothing
        -- using Config.defaultOptions
        |> List.map (Block.walkInlines rcMediaText)
        |> List.concatMap (rcBlockView htmlFun)
        |> Html.div []


toc : String -> List ( Int, String )
toc str =
    str
        |> Block.parse Nothing
        |> List.map (Block.query getHeader)
        |> List.concat


getHeader : Block b i -> List ( Int, String )
getHeader block =
    case block of
        Heading _ lvl inlines ->
            [ ( lvl, Inline.extractText inlines ) ]

        _ ->
            []
