module RCAPI exposing (APIExposition, APIMedia, APIMediaEntry, getExposition, getMediaList, toRCExposition, toRCMediaObject, uploadMedia)

import Dict
import Exposition exposing (OptionalDimensions, RCExposition, RCMediaObject, RCMediaType(..), defaultPlayerSettings)
import File exposing (File)
import Html exposing (Html, span)
import Http
import Json.Decode exposing (..)
import Problems exposing (..)


type alias APIExposition =
    { html : String, markdown : String, metadata : String, style : String, title : String }


type alias APIMediaEntry =
    { id : Int, media : APIMedia, description : String, copyright : String, name : String }


type alias APIMedia =
    { mediaType : String, status : String, width : Int, height : Int }


apiExposition : Decoder APIExposition
apiExposition =
    map5 APIExposition
        (at [ "html" ] string)
        (at [ "markdown" ] string)
        (at [ "metadata" ] string)
        (at [ "style" ] string)
        (at [ "title" ] string)


apiMediaEntry : Decoder APIMediaEntry
apiMediaEntry =
    map5 APIMediaEntry
        (at [ "id" ] int)
        (at [ "media" ] apiMedia)
        (at [ "description" ] string)
        (at [ "copyright" ] string)
        (at [ "name" ] string)


apiMedia : Decoder APIMedia
apiMedia =
    map4 APIMedia
        (at [ "type" ] string)
        (at [ "status" ] string)
        (at [ "width" ] int)
        (at [ "height" ] int)


getMediaList id msg =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg (list apiMediaEntry)
        }


getExposition : Int -> Int -> (Result Http.Error APIExposition -> msg) -> Cmd msg
getExposition researchId weave msg =
    Http.get
        { url = " text-editor/load?research=" ++ String.fromInt researchId ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg apiExposition
        }



--


uploadMedia : Int -> File -> Http.Expect msg -> Cmd msg
uploadMedia researchId file expect =
    Http.request
        { method = "POST"
        , url = "text-editor/simple-media-add" ++ "?research=" ++ String.fromInt researchId
        , headers = []
        , body =
            Http.multipartBody
                [ Http.stringPart "mediatype" "image"
                , Http.stringPart "name" "tmpName"
                , Http.stringPart "copyrightholder" "copyrightholder"
                , Http.stringPart "description" "description"
                , Http.filePart "media" file
                , Http.stringPart "thumb" ""
                ]
        , expect = expect
        , timeout = Nothing
        , tracker = Just "upload"
        }



-- POST PROCESS API RETURN VALUES


toRCExposition : APIExposition -> Int -> Int -> RCExposition msg
toRCExposition apiExpo id weave =
    { css = apiExpo.style
    , title = apiExpo.title
    , authors = []
    , id = id
    , currentWeave = weave
    , renderedHtml = span [] [] -- we don't actually use the html in the saved object
    , markdownInput = apiExpo.markdown
    , media = []
    }


getDimensions : APIMedia -> OptionalDimensions
getDimensions media =
    Just ( media.width, media.height )


getType : APIMedia -> Result String RCMediaType
getType media =
    case media.mediaType of
        "image" ->
            Ok RCImage

        "pdf" ->
            Ok RCPdf

        "audio" ->
            Ok (RCAudio defaultPlayerSettings)

        "video" ->
            Ok (RCVideo defaultPlayerSettings)

        str ->
            Err ("Unknown Media Type: " ++ str)


toRCMediaObject : Int -> APIMediaEntry -> Result Problem RCMediaObject
toRCMediaObject researchId mediaEntry =
    let
        mediaType =
            getType mediaEntry.media
    in
    case mediaType of
        Ok mtype ->
            Ok
                { userClass = "" -- needed?
                , dimensions = getDimensions mediaEntry.media
                , id = mediaEntry.id
                , htmlId = "" -- needed?
                , thumb = "" -- needed?
                , expositionId = researchId
                , name = mediaEntry.name
                , description = mediaEntry.description
                , copyright = mediaEntry.copyright
                , caption = "" -- needd?
                , version = 0 -- needed?
                , mediaType = mtype
                }

        Err s ->
            Err (CannotLoadMedia s)



-- TODO
-- get user class from rc metadata
-- process rc expo metadata
