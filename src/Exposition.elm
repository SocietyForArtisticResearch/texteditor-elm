module Exposition exposing (OptionalDimensions, Preload(..), RCExposition, RCMediaObject, RCMediaObjectValidation, RCMediaObjectViewState, RCMediaType(..), TOC, TOCEntry, addOrReplaceObject, asHtml, asMarkdown, defaultPlayerSettings, empty, mediaUrl, objectByNameOrId, render, replaceObject, replaceToolsWithImages, thumbUrl, validateMediaObject, withMd)

import Html as Html
import Html.Attributes as Attr
import RCMD
import Regex


type alias RCExposition msg =
    { css : String
    , title : String
    , authors : List String
    , id : Int
    , currentWeave : Int
    , renderedHtml : Html.Html msg
    , markdownInput : String
    , media : List RCMediaObject
    }


empty : RCExposition msg
empty =
    { css = ""
    , title = ""
    , authors = []
    , id = 0
    , currentWeave = 0
    , renderedHtml = Html.div [] []
    , markdownInput = ""
    , media = []
    }


withMd : RCExposition msg -> String -> RCExposition msg
withMd exp content =
    { exp | markdownInput = content }


type alias OptionalDimensions =
    Maybe ( Int, Int )


type alias PlaySettings =
    { autoplay : Bool
    , loop : Bool
    , preload : Preload
    }


defaultPlayerSettings : PlaySettings
defaultPlayerSettings =
    { autoplay = False, loop = False, preload = Auto }


type RCMediaType
    = RCVideo PlaySettings
    | RCAudio PlaySettings
    | RCSvg
    | RCPdf
    | RCImage


type alias RCMediaObject =
    { userClass : String
    , dimensions : OptionalDimensions
    , id : Int
    , htmlId : String
    , thumb : String
    , expositionId : Int
    , name : String
    , description : String
    , copyright : String
    , caption : String
    , version : Int
    , mediaType : RCMediaType
    }


type Preload
    = Auto
    | Metadata
    | None


type alias TOCEntry =
    { level : Int
    , title : String
    , id : String
    }


type alias TOC =
    List TOCEntry


preloadToString : Preload -> String
preloadToString p =
    case p of
        Auto ->
            "auto"

        Metadata ->
            "metadata"

        None ->
            "none"


objectByNameOrId : String -> RCExposition msg -> Maybe RCMediaObject
objectByNameOrId nameOrId exp =
    case String.toInt nameOrId of
        Just id ->
            let
                idLst =
                    List.filter (\m -> m.id == id) exp.media
            in
            List.head idLst

        Nothing ->
            let
                nameLst =
                    List.filter (\m -> m.name == nameOrId) exp.media
            in
            List.head nameLst


removeObjectWithID : Int -> RCExposition msg -> RCExposition msg
removeObjectWithID id exp =
    { exp | media = List.filter (\m -> m.id /= id) exp.media }


replaceObject : RCMediaObject -> RCExposition msg -> RCExposition msg
replaceObject obj exp =
    { exp
        | media =
            List.map
                (\m ->
                    if m.id == obj.id then
                        obj

                    else
                        m
                )
                exp.media
    }


addObject : RCMediaObject -> RCExposition msg -> RCExposition msg
addObject obj exp =
    { exp | media = obj :: exp.media }


addOrReplaceObject : RCMediaObject -> RCExposition msg -> RCExposition msg
addOrReplaceObject obj exp =
    if List.any (\m -> m.id == obj.id) exp.media then
        replaceObject obj exp

    else
        addObject obj exp


mediaUrl : RCMediaObject -> String
mediaUrl data =
    "/text-editor/simple-media-resource?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id


thumbUrl : RCMediaObject -> String
thumbUrl data =
    "/text-editor/simple-media-thumb?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id
        ++ "&width=132&height=132"


versionString : RCMediaObject -> String
versionString data =
    "&t=" ++ String.fromInt data.version


withPrefix : Maybe String -> String -> String
withPrefix prefix str =
    case prefix of
        Nothing ->
            str

        Just pre ->
            pre ++ str


addDimensions : OptionalDimensions -> List (Html.Attribute msg) -> List (Html.Attribute msg)
addDimensions dims attributes =
    case dims of
        Nothing ->
            attributes

        Just ( h, w ) ->
            attributes ++ [ Attr.height h, Attr.width w ]



-- VALIDATION


validateName : RCExposition msg -> RCMediaObject -> String -> Result String String
validateName exp obj newName =
    if String.length newName < 4 then
        Err "Name is too short"

    else
        let
            mediaNames =
                List.map (\m -> m.name) exp.media

            objName =
                obj.name
        in
        if (obj.name /= newName) && List.member newName mediaNames then
            Err "Another media object already has this name"

        else
            Ok newName


type alias RCMediaObjectValidation =
    { name : Result String String
    , description : Result String String
    , copyright : Result String String
    , userClass : Result String String
    }


type alias RCMediaObjectViewState =
    { validation : RCMediaObjectValidation
    , thumbUrl : String
    , id : Int
    }


validateMediaObject : RCExposition msg -> RCMediaObject -> RCMediaObject -> RCMediaObjectViewState
validateMediaObject exp objInModel objInEdit =
    let
        validation =
            { name = validateName exp objInModel objInEdit.name
            , description = Ok objInEdit.description
            , copyright = Ok objInEdit.copyright
            , userClass = Ok objInEdit.userClass
            }
    in
    { validation = validation
    , thumbUrl = thumbUrl objInModel
    , id = objInModel.id
    }


isValid : RCMediaObjectValidation -> Bool
isValid st =
    case ( ( st.name, st.description ), ( st.copyright, st.userClass ) ) of
        ( ( Ok _, Ok _ ), ( Ok _, Ok _ ) ) ->
            True

        _ ->
            False



-- MARKDOWN and HTML rendering


objectDiv : RCMediaObject -> Html.Html msg -> Html.Html msg
objectDiv obj child =
    Html.div
        [ Attr.id (String.fromInt obj.id)
        , Attr.classList
            [ ( "rcobject", True )
            , ( obj.userClass, obj.userClass /= "" )
            ]
        ]
        [ child ]


asMarkdown : RCMediaObject -> String
asMarkdown media =
    "![" ++ media.name ++ "](" ++ mediaUrl media ++ ")"


asHtml : RCMediaObject -> Html.Html msg
asHtml media =
    case ( media.mediaType, media ) of
        ( RCImage, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.img (addDimensions data.dimensions [ Attr.src (mediaUrl data), Attr.alt data.name ]) []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCPdf, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/pdf"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCSvg, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/svg+xml"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCAudio playerData, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.audio
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerData.preload)
                            , Attr.autoplay playerData.autoplay
                            , Attr.loop playerData.loop
                            ]
                        )
                        [ Html.source [ Attr.src (mediaUrl data) ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCVideo playerData, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.video
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerData.preload)
                            , Attr.autoplay playerData.autoplay
                            , Attr.loop playerData.loop
                            ]
                        )
                        [ Html.source [ Attr.src (mediaUrl data), Attr.attribute "type" "video/mp4" ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]


htmlForMediaString : RCExposition msg -> String -> Html.Html msg
htmlForMediaString expo mediaString =
    case objectByNameOrId mediaString expo of
        Nothing ->
            Html.div [] []

        Just o ->
            asHtml o


render : RCExposition msg -> RCExposition msg
render exp =
    { exp | renderedHtml = RCMD.rcToHtml (htmlForMediaString exp) exp.markdownInput }


replaceToolsWithImages : RCExposition msg -> Maybe String -> String
replaceToolsWithImages exp urlPrefix =
    let
        md =
            exp.markdownInput

        r =
            Regex.fromString "!{([^}]*)}"
    in
    case r of
        Nothing ->
            md

        Just reg ->
            Regex.replace reg
                (\m ->
                    case m.submatches of
                        (Just sub) :: _ ->
                            Maybe.withDefault "" <|
                                Maybe.map
                                    (\s ->
                                        "!["
                                            ++ s.name
                                            ++ "]("
                                            ++ withPrefix urlPrefix (mediaUrl s)
                                            ++ ")"
                                    )
                                    (objectByNameOrId sub exp)

                        _ ->
                            ""
                )
                md


toc : RCExposition msg -> List TOCEntry
toc exp =
    List.map
        (\( level, title, id ) ->
            { level = level
            , title = title
            , id = id
            }
        )
        (RCMD.toc exp.markdownInput)



-- integrateMediaList
-- integrateSerializedMediaInfo
