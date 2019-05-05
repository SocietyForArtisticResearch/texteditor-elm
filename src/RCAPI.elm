module RCAPI exposing (APIExposition, APIMedia, APIMediaEntry, getExposition, getMediaList, toMediaClassesDict, toRCExposition, toRCMediaObject, uploadMedia)

import Dict
import Exposition exposing (OptionalDimensions, RCExposition, RCMediaObject, RCMediaType(..), defaultPlayerSettings)
import File exposing (File)
import Html exposing (Html, span)
import Http
import Json.Decode exposing (..)
import Problems exposing (..)
import Settings



-- BACKEND DATA TYPES


type alias APIExpositionMetadata =
    -- spelled "editorversion" in json
    { editorVersion : String, contentVersion : Int }


type alias APIAdditionalMediaMetadata =
    { id : Int, name : String, userClass : Maybe String }


type alias APIExposition =
    { html : String
    , markdown : String
    , media : List APIAdditionalMediaMetadata
    , metadata : APIExpositionMetadata
    , style : String
    , title : String
    }


type alias APIMediaEntry =
    { id : Int, media : APIMedia, description : String, copyright : String, name : String }


type alias APIMedia =
    { mediaType : String, status : String, width : Int, height : Int }


apiExposition : Decoder APIExposition
apiExposition =
    map6 APIExposition
        (field "html" string)
        (field "markdown" string)
        (field "media" (list apiAdditionalMediaMetadata))
        (field "metadata" apiExpositionMetadata)
        (field "style" string)
        (field "title" string)


apiAdditionalMediaMetadata : Decoder APIAdditionalMediaMetadata
apiAdditionalMediaMetadata =
    map3 APIAdditionalMediaMetadata
        (field "id" int)
        (field "name" string)
        (maybe (field "userClass" string))


apiExpositionMetadata : Decoder APIExpositionMetadata
apiExpositionMetadata =
    map2
        APIExpositionMetadata
        (field "editorversion" string)
        (field "contentVersion" int)


apiMediaEntry : Decoder APIMediaEntry
apiMediaEntry =
    map5 APIMediaEntry
        (field "id" int)
        (field "media" apiMedia)
        (field "description" string)
        (field "copyright" string)
        (field "name" string)


apiMedia : Decoder APIMedia
apiMedia =
    map4 APIMedia
        (field "type" string)
        (field "status" string)
        (field "width" int)
        (field "height" int)



-- HTTP REQUESTS


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
    , editorVersion = apiExpo.metadata.editorVersion
    , contentVersion = apiExpo.metadata.contentVersion
    }


toMediaClassesDict : APIExposition -> Dict.Dict Int String
toMediaClassesDict apiExpo =
    List.foldr (\( id, cl ) d -> Dict.insert id cl d)
        Dict.empty
        (List.filterMap
            (\m ->
                case m.userClass of
                    Just cl ->
                        Just ( m.id, cl )

                    Nothing ->
                        Nothing
            )
            apiExpo.media
        )


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
                { userClass = ""
                , dimensions = getDimensions mediaEntry.media
                , id = mediaEntry.id
                , htmlId = "" -- needed?
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
-- saving
