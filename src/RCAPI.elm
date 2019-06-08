module RCAPI exposing (APIExposition, APIMedia, APIMediaEntry, APIPandocImport, ConversionType(..), convertExposition, deleteMedia, getExposition, getMediaList, saveExposition, toMediaClassesDict, toRCExposition, toRCMediaObject, updateMedia, uploadImport, uploadMedia)

--import Bytes.Decode

import Bytes.Encode
import Dict
import Exposition exposing (OptionalDimensions, RCExposition, RCMediaObject, RCMediaType(..), TOC, TOCEntry, defaultPlayerSettings)
import File exposing (File)
import File.Download
import Html exposing (Html, span)
import Http
import Json.Decode exposing (..)
import Json.Encode as Encode
import Problems exposing (..)
import Settings
import Url.Builder



-- BACKEND DATA TYPES


type Either a b
    = Left a
    | Right b


eitherString : Decoder (Either String b)
eitherString =
    map Left string


rightDecoder : Decoder b -> Decoder (Either a b)
rightDecoder decoder =
    map Right decoder


withDefault : String -> String -> String
withDefault default str =
    if str == "" then
        default

    else
        str


type alias APIExpositionMetadata =
    { editorVersion : String, contentVersion : Int }


type alias APIAdditionalMediaMetadata =
    { id : Int, name : Maybe String, userClass : Maybe String }


type alias APIExposition =
    { html : String
    , markdown : String
    , media : Either String (List APIAdditionalMediaMetadata)
    , metadata : Either String APIExpositionMetadata
    , style : String
    , title : String
    }


mkExposition : Maybe String -> Maybe String -> Either String (List APIAdditionalMediaMetadata) -> Either String APIExpositionMetadata -> Maybe String -> String -> APIExposition
mkExposition html md media meta style title =
    APIExposition (Maybe.withDefault "" html) (Maybe.withDefault "" md) media meta (Maybe.withDefault "" style) title


type alias APIMediaEntry =
    { id : Int, media : APIMedia, description : String, copyright : String, name : String }


mkMediaEntry : Int -> APIMedia -> Maybe String -> Maybe String -> String -> APIMediaEntry
mkMediaEntry id media description copyright name =
    APIMediaEntry id media (Maybe.withDefault "" description) (Maybe.withDefault "" copyright) name


type alias APIMedia =
    { mediaType : String, status : String, width : Int, height : Int }


type alias APIPandocImport =
    { media : List Int, markdown : String }



-- DECODERS


apiExposition : Decoder APIExposition
apiExposition =
    map6 mkExposition
        (maybe (field "html" string))
        (maybe (field "markdown" string))
        (field "media" (oneOf [ eitherString, rightDecoder (list apiAdditionalMediaMetadata) ]))
        -- should work for both ways of encoding
        (field "metadata" (oneOf [ eitherString, rightDecoder apiExpositionMetadata ]))
        -- should work for both ways of encoding
        (maybe (field "style" string))
        (field "title" string)


apiAdditionalMediaMetadata : Decoder APIAdditionalMediaMetadata
apiAdditionalMediaMetadata =
    map3 APIAdditionalMediaMetadata
        (field "id" int)
        (maybe (field "name" string))
        (maybe (field "userClass" string))


apiExpositionMetadata : Decoder APIExpositionMetadata
apiExpositionMetadata =
    map2
        APIExpositionMetadata
        (oneOf [ field "editorversion" string, field "editorVersion" string ])
        (field "contentVersion" int)


apiMediaEntry : Decoder APIMediaEntry
apiMediaEntry =
    map5 mkMediaEntry
        (field "id" int)
        (field "media" apiMedia)
        (maybe (field "description" string))
        (maybe (field "copyright" string))
        (field "name" string)


apiMedia : Decoder APIMedia
apiMedia =
    map4 APIMedia
        (field "type" string)
        (field "status" string)
        (field "width" int)
        (field "height" int)


apiPandocImport : Decoder APIPandocImport
apiPandocImport =
    map2 APIPandocImport
        (field "media" (list int))
        (field "markdown" string)



-- HTTP REQUESTS


getMediaList id msg =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg (list apiMediaEntry)
        }


getExposition : Int -> Int -> (Result Http.Error APIExposition -> msg) -> Cmd msg
getExposition researchId weave msg =
    Http.get
        { url = "text-editor/load?research=" ++ String.fromInt researchId ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg apiExposition
        }


uploadMedia : Int -> String -> File -> Http.Expect msg -> Cmd msg
uploadMedia researchId mediaName file expect =
    Http.request
        { method = "POST"
        , url = "text-editor/simple-media-add" ++ "?research=" ++ String.fromInt researchId
        , headers = []
        , body =
            Http.multipartBody
                [ Http.stringPart "mediatype" "image"
                , Http.stringPart "name" mediaName
                , Http.stringPart "copyrightholder" "copyright holder"
                , Http.stringPart "description" "description"
                , Http.stringPart "license" "all-rights-reserved"
                , Http.filePart "media" file
                , Http.stringPart "thumb" ""
                ]
        , expect = expect
        , timeout = Nothing
        , tracker = Just "uploadMedia"
        }


updateMedia : RCMediaObject -> Http.Expect msg -> Cmd msg
updateMedia mediaObject expect =
    Http.request
        { method = "POST"
        , url =
            "text-editor/simple-media-edit"
                ++ "?research="
                ++ String.fromInt mediaObject.expositionId
                ++ "&simple-media="
                ++ String.fromInt mediaObject.id
        , headers = []
        , body =
            Http.multipartBody
                [ Http.stringPart "name" mediaObject.name
                , Http.stringPart "copyrightholder" (withDefault "copyright holder" mediaObject.copyright)
                , Http.stringPart "description" mediaObject.description
                , Http.stringPart "license" "all-rights-reserved"
                ]
        , expect = expect
        , timeout = Nothing
        , tracker = Nothing
        }


deleteMedia : RCMediaObject -> (Result Http.Error () -> msg) -> Cmd msg
deleteMedia mediaObject expect =
    Http.post
        { url =
            "text-editor/simple-media-remove?research="
                ++ String.fromInt mediaObject.expositionId
                ++ "&simple-media="
                ++ String.fromInt mediaObject.id
        , body = Http.emptyBody
        , expect = Http.expectWhatever expect
        }


uploadImport : Int -> File -> (Result Http.Error APIPandocImport -> msg) -> Cmd msg
uploadImport researchId file expectMsg =
    Http.request
        { method = "POST"
        , url = "text-editor/import" ++ "?research=" ++ String.fromInt researchId
        , headers = []
        , body =
            Http.multipartBody
                [ Http.filePart "file" file
                ]
        , expect = Http.expectJson expectMsg apiPandocImport
        , timeout = Nothing
        , tracker = Just "uploadImport"
        }


type ConversionType
    = Pdf
    | Docx
    | Odt
    | Latex
    | Html
    | Md
    | Epub


typeEnding : ConversionType -> String
typeEnding t =
    case t of
        Pdf ->
            "pdf"

        Docx ->
            "docx"

        Odt ->
            "odt"

        Latex ->
            "tex"

        Html ->
            "html"

        Md ->
            "md"

        Epub ->
            "epub"


convertExposition : ConversionType -> RCExposition -> Cmd msg
convertExposition ctype expo =
    -- TODO tools to images
    let
        path =
            Url.Builder.relative [ "text-editor", "export" ]
                [ Url.Builder.string "type" (typeEnding ctype)
                , Url.Builder.string "markdown" expo.markdownInput
                ]
    in
    File.Download.url path



-- convertExposition : ConversionType -> RCExposition -> (Result Http.Error a -> msg) -> Cmd msg
-- convertExposition ctype expo expectMsg =
--     Http.post
--         { url =
--             "text-editor/export"
--                 ++ "?type="
--                 ++ typeEnding ctype
--                 ++ "&markdown="
--                 ++ expo.markdownInput
--         , body = Http.emptyBody
--         , expect = Http.expectBytes expectMsg Bytes.Decode.bytes
--         }


saveExposition exposition expect =
    let
        url =
            "text-editor/save"
                ++ "?research="
                ++ String.fromInt exposition.id
                ++ "&weave="
                ++ String.fromInt exposition.currentWeave

        _ =
            Debug.log "about to save exposition: " exposition

        encodedToc =
            Encode.encode 0 <|
                Encode.list
                    (\te ->
                        Encode.object
                            [ ( "level", Encode.int te.level )
                            , ( "title", Encode.string te.title )
                            , ( "id", Encode.string te.id )
                            ]
                    )
                    exposition.toc
    in
    Http.request
        { method = "POST"
        , url = url
        , headers = []
        , body =
            Http.multipartBody
                [ Http.stringPart "html" exposition.renderedHtml
                , Http.stringPart "markdown" exposition.markdownInput
                , Http.stringPart "style" exposition.css
                , Http.stringPart "title" exposition.title
                , Http.stringPart "media"
                    (Encode.encode 0
                        (Encode.list
                            (\m ->
                                Encode.object
                                    [ ( "id", Encode.int m.id )
                                    , ( "userClass", Encode.string m.userClass )
                                    ]
                            )
                            exposition.media
                        )
                    )
                , Http.stringPart "metadata"
                    (Encode.encode
                        0
                        (Encode.object
                            [ ( "editorVersion", Encode.string exposition.editorVersion )
                            , ( "contentVersion", Encode.int exposition.contentVersion )
                            ]
                        )
                    )
                , Http.stringPart "toc" encodedToc
                ]

        --        , expect = Http.expectWhatever expect
        , expect = Http.expectString expect
        , timeout = Nothing
        , tracker = Nothing
        }



-- POST PROCESS API RETURN VALUES
-- needs to be done because older api encodes field as string


decodeMedia : APIExposition -> APIExposition
decodeMedia exp =
    let
        mediaField =
            case exp.media of
                Left s ->
                    case decodeString (list apiAdditionalMediaMetadata) s of
                        Ok data ->
                            Right data

                        _ ->
                            Left s

                Right d ->
                    Right d
    in
    { exp | media = mediaField }



-- needs to be done because older api encodes field as string


decodeMetadata : APIExposition -> APIExposition
decodeMetadata exp =
    let
        metadataField =
            case exp.metadata of
                Left s ->
                    case decodeString apiExpositionMetadata s of
                        Ok data ->
                            Right data

                        _ ->
                            Left s

                Right d ->
                    Right d
    in
    { exp | metadata = metadataField }


getMetadata : APIExposition -> APIExpositionMetadata
getMetadata exp =
    case exp.metadata of
        Left s ->
            { editorVersion = Settings.editorVersion, contentVersion = 0 }

        Right d ->
            d


toRCExposition : APIExposition -> Int -> Int -> RCExposition
toRCExposition apiExpo id weave =
    let
        exp =
            decodeMetadata (decodeMedia apiExpo)
    in
    Exposition.updateToc
        { css = apiExpo.style
        , title = apiExpo.title
        , authors = []
        , id = id
        , currentWeave = weave
        , renderedHtml = apiExpo.html
        , markdownInput = apiExpo.markdown
        , media = []
        , editorVersion = (getMetadata exp).editorVersion
        , contentVersion = (getMetadata exp).contentVersion
        , toc = []
        }


toMediaClassesDict : APIExposition -> Dict.Dict Int String
toMediaClassesDict apiExpo =
    let
        exp =
            decodeMetadata (decodeMedia apiExpo)
    in
    case exp.media of
        Right lst ->
            Dict.fromList
                (List.filterMap
                    (\m ->
                        case m.userClass of
                            Just cl ->
                                Just ( m.id, cl )

                            Nothing ->
                                Nothing
                    )
                    lst
                )

        Left _ ->
            let
                _ =
                    Debug.log "error decoding user classes media list: " exp.media
            in
            Dict.empty


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
