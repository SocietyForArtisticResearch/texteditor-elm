module Exposition exposing (OptionalDimensions, Preload(..), RCExposition, RCMediaObject(..), RCObjectData, RCPlayerSettings, TOC, TOCEntry, asHtml, asMarkdown, empty, mediaUrl, objectByNameOrId, render, replaceToolsWithImages, thumbUrl, withMd)

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


type alias RCObjectData =
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


type alias RCPlayerSettings =
    { autoplay : Bool
    , loop : Bool
    , preload : Preload
    }


type RCMediaObject
    = RCVideo RCObjectData RCPlayerSettings
    | RCAudio RCObjectData RCPlayerSettings
    | RCSvg RCObjectData
    | RCPdf RCObjectData
    | RCImage RCObjectData


objData : RCMediaObject -> RCObjectData
objData media =
    case media of
        RCVideo d _ ->
            d

        RCAudio d _ ->
            d

        RCSvg d ->
            d

        RCPdf d ->
            d

        RCImage d ->
            d


objectByNameOrId : String -> RCExposition msg -> Maybe RCMediaObject
objectByNameOrId nameOrId exp =
    case String.toInt nameOrId of
        Just id ->
            let
                idLst =
                    List.filter (\m -> (objData m).id == id) exp.media
            in
            List.head idLst

        Nothing ->
            let
                nameLst =
                    List.filter (\m -> (objData m).name == nameOrId) exp.media
            in
            List.head nameLst


removeObjectWithID : Int -> RCExposition msg -> RCExposition msg
removeObjectWithID id exp =
    { exp | media = List.filter (\m -> (objData m).id /= id) exp.media }


replaceObject : RCMediaObject -> RCExposition msg -> RCExposition msg
replaceObject obj exp =
    { exp
        | media =
            List.map
                (\m ->
                    if (objData m).id == (objData obj).id then
                        obj

                    else
                        m
                )
                exp.media
    }


addObject : RCMediaObject -> RCExposition msg -> RCExposition msg
addObject obj exp =
    { exp | media = obj :: exp.media }


mediaUrl : RCObjectData -> String
mediaUrl data =
    "/text-editor/simple-media-resource?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id


thumbUrl : RCObjectData -> String
thumbUrl data =
    "/text-editor/simple-media-thumb?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id
        ++ "&width=132&height=132"


versionString : RCObjectData -> String
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
                List.map (\m -> (objData m).name) exp.media

            objName =
                (objData obj).name
        in
        if ((objData obj).name /= newName) && List.member newName mediaNames then
            Err "Another media object already has this name"

        else
            Ok "newName"


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
            { name = validateName exp objInModel (objData objInEdit).name
            , description = Ok (objData objInEdit).description
            , copyright = Ok (objData objInEdit).copyright
            , userClass = Ok (objData objInEdit).userClass
            }
    in
    { validation = validation
    , thumbUrl = thumbUrl (objData objInModel)
    , id = (objData objInModel).id
    }



-- MARKDOWN and HTML rendering


objectDiv : RCObjectData -> Html.Html msg -> Html.Html msg
objectDiv objdata child =
    Html.div
        [ Attr.id (String.fromInt objdata.id)
        , Attr.classList
            [ ( "rcobject", True )
            , ( objdata.userClass, objdata.userClass /= "" )
            ]
        ]
        [ child ]


asMarkdown : RCMediaObject -> String
asMarkdown media =
    let
        dataobject =
            objData media
    in
    "![" ++ dataobject.name ++ "](" ++ mediaUrl dataobject ++ ")"


asHtml : RCMediaObject -> Html.Html msg
asHtml media =
    case media of
        RCImage data ->
            objectDiv data <|
                Html.figure []
                    [ Html.img (addDimensions data.dimensions [ Attr.src (mediaUrl data), Attr.alt data.name ]) []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCPdf data ->
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

        RCSvg data ->
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

        RCAudio data playerSettings ->
            objectDiv data <|
                Html.figure []
                    [ Html.audio
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
                            ]
                        )
                        [ Html.source [ Attr.src (mediaUrl data) ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCVideo data playerSettings ->
            objectDiv data <|
                Html.figure []
                    [ Html.video
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
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
                                        let
                                            d =
                                                objData s
                                        in
                                        "!["
                                            ++ d.name
                                            ++ "]("
                                            ++ withPrefix urlPrefix (mediaUrl d)
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



-- updateOrCreateObject
-- integrateMediaList
-- integrateSerializedMediaInfo
