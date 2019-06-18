port module Main exposing (Msg(..), main, update, view)

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Dropdown as Dropdown
import Bootstrap.Form as Form
import Bootstrap.Form.Checkbox as Checkbox
import Bootstrap.Grid as Grid
import Bootstrap.Modal as Modal
import Bootstrap.Utilities.Spacing as Spacing
import Browser
import Dict
import Exposition exposing (RCExposition, RCMediaObject, RCMediaObjectViewState, addMediaUserClasses, incContentVersion)
import File exposing (File)
import File.Select as Select
import Html exposing (Html, a, button, div, img, li, p, span, text, ul)
import Html.Attributes exposing (attribute, class, for, href, id, src)
import Html.Events exposing (on, onCheck, onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Problems
import RCAPI
import RCMediaEdit
import RCMediaList
import Regex
import Settings exposing (..)
import String.Extra as Str
import Time
import UserConfirm exposing (ConfirmDialogContent)
import View exposing (..)


type alias Model =
    { exposition : RCExposition
    , editGeneration : ( Int, Int )
    , mediaDialog : ( Modal.Visibility, Maybe ( RCMediaObject, Int ), Maybe RCMediaObjectViewState )
    , confirmDialog : ( Modal.Visibility, Maybe ConfirmDialogContent, Maybe (UserConfirm.Messages Msg) )
    , mediaPickerDialog : Modal.Visibility
    , alertVisibility : Alert.Visibility
    , weave : Int
    , research : Int
    , mediaUploadStatus : UploadStatus
    , importUploadStatus : UploadStatus
    , problems : List Problems.Problem
    , mediaClassesDict : Dict.Dict Int String -- stores userclasses for media to be added to media list
    , saved : Bool
    , editor : ( EditorType, MarkdownEditor )
    , exportDropState : Dropdown.State
    }


type UploadStatus
    = Ready
    | Uploading Float


type
    TabState
    -- to communicate with the port
    = CmMarkdownTab
    | TxtMarkdownTab
    | StyleTab
    | MediaListTab


type EditorType
    = EditorMarkdown
    | EditorStyle
    | EditorMedia


selectedEditorIsMarkdown : Model -> Bool
selectedEditorIsMarkdown model =
    case model.editor of
        ( EditorMarkdown, _ ) ->
            True

        _ ->
            False


type MarkdownEditor
    = CodemirrorMarkdown
    | TextareaMarkdown


getTabState : ( EditorType, MarkdownEditor ) -> TabState
getTabState state =
    case state of
        ( EditorMarkdown, CodemirrorMarkdown ) ->
            CmMarkdownTab

        ( EditorMarkdown, TextareaMarkdown ) ->
            TxtMarkdownTab

        ( EditorStyle, _ ) ->
            StyleTab

        ( EditorMedia, _ ) ->
            MediaListTab


type alias Flags =
    { weave : Int, research : Int }


decodeFlags : D.Decoder Flags
decodeFlags =
    D.map2 Flags (D.field "weave" D.int) (D.field "research" D.int)


emptyModel : Int -> Int -> Model
emptyModel research weave =
    { editGeneration = ( -1, -1 )
    , exposition = Exposition.empty
    , mediaDialog = ( Modal.hidden, Nothing, Nothing )
    , confirmDialog = ( Modal.hidden, Nothing, Nothing )
    , mediaPickerDialog = Modal.hidden
    , alertVisibility = Alert.closed
    , research = research
    , weave = weave
    , mediaUploadStatus = Ready
    , importUploadStatus = Ready
    , problems = []
    , mediaClassesDict = Dict.empty
    , saved = True
    , editor = ( EditorMarkdown, CodemirrorMarkdown )
    , exportDropState = Dropdown.initialState
    }


init : D.Value -> ( Model, Cmd Msg )
init flags =
    case D.decodeValue decodeFlags flags of
        Ok fl ->
            ( emptyModel fl.research fl.weave
            , RCAPI.getExposition fl.research fl.weave GotExposition
            )

        Err str ->
            let
                _ =
                    Debug.log "err" str
            in
            ( addProblem (emptyModel -1 -1) Problems.WrongExpositionUrl
            , Cmd.none
            )


addProblem : Model -> Problems.Problem -> Model
addProblem model problem =
    { model | problems = problem :: model.problems, alertVisibility = Alert.shown }


addProblems : Model -> List Problems.Problem -> Model
addProblems model problems =
    { model | problems = problems ++ model.problems, alertVisibility = Alert.shown }


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- PORTS
-- code mirror markdown


port currentGeneration : (E.Value -> msg) -> Sub msg


port cmContent : (E.Value -> msg) -> Sub msg


port getContent : () -> Cmd msg


port setContent : E.Value -> Cmd msg


updateEditorContent : Model -> Cmd msg
updateEditorContent model =
    setContent
        (E.object
            [ ( "md"
              , E.string model.exposition.markdownInput
              )
            , ( "style", E.string model.exposition.css )
            ]
        )


port mediaDialog : (E.Value -> msg) -> Sub msg


port setEditor : Int -> Cmd msg


port insertMdString : ( String, Int ) -> Cmd msg



--- markdown conversion using marked


port convertMarkdown : String -> Cmd msg


port getHtml : (String -> msg) -> Sub msg


port setPreviewContent : String -> Cmd msg


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ currentGeneration EditGeneration
        , cmContent MdContent
        , getHtml GotConvertedHtml
        , mediaDialog CMOpenMediaDialog
        , Http.track "uploadMedia" GotMediaUploadProgress
        , Http.track "uploadImport" GotImportUploadProgress
        , Dropdown.subscriptions model.exportDropState ExportDropMsg
        , Time.every 15000 (\_ -> SaveExposition)
        ]



-- MESSAGES


type Msg
    = EditGeneration E.Value
    | MdContent E.Value
    | MediaDialog String
    | CMOpenMediaDialog E.Value
    | GotConvertedHtml String
    | MediaEdit ( String, Exposition.RCMediaObject )
    | MediaDelete Exposition.RCMediaObject
    | CloseMediaDialog
    | GotExposition (Result Http.Error RCAPI.APIExposition)
    | GotMediaList (Result Http.Error (List RCAPI.APIMediaEntry))
    | UploadMediaFileSelect
    | UploadMediaFileSelected File
    | UploadImportFileSelect
    | UploadImportFileSelected File
    | GotMediaUploadProgress Http.Progress
    | GotImportUploadProgress Http.Progress
    | Uploaded (Result Http.Error String)
    | UploadedImport (Result Http.Error RCAPI.APIPandocImport)
    | SaveExposition
    | SavedExposition (Result Http.Error String)
    | SaveMediaEdit Exposition.RCMediaObject
    | SavedMediaEdit (Result Http.Error String)
    | ConfirmMediaDelete Exposition.RCMediaObject
    | CloseConfirmDialog
    | SwitchTab EditorType
    | MediaDeleted (Result Http.Error ())
    | AlertMsg Alert.Visibility
    | SwitchMarkdownEditor MarkdownEditor
    | DownloadExport RCAPI.ConversionType
    | InsertAtCursor ( String, Int ) -- string and cursor offest after insert
    | InsertMediaAtCursor RCMediaObject
    | OpenMediaPicker
    | CloseMediaPicker
    | ExportDropMsg Dropdown.State
    | BadUploadFileType String



-- not yet validated, only update request


makeMediaEditFun : Exposition.RCMediaObject -> Int -> RCMediaEdit.Field -> String -> Msg
makeMediaEditFun obj objId field input =
    case field of
        RCMediaEdit.Name ->
            MediaEdit ( String.fromInt objId, { obj | name = input } )

        RCMediaEdit.Description ->
            MediaEdit ( String.fromInt objId, { obj | description = input } )

        RCMediaEdit.UserClass ->
            MediaEdit ( String.fromInt objId, { obj | userClass = input } )

        RCMediaEdit.Copyright ->
            MediaEdit ( String.fromInt objId, { obj | copyright = input } )


makeTableMessages : RCMediaList.TableMessages Msg
makeTableMessages =
    { editObject = MediaDialog
    , deleteObject = ConfirmMediaDelete
    , insertObject = InsertMediaAtCursor
    }


makePickerMessages : RCMediaList.PickerMessages Msg
makePickerMessages =
    { insertObject = InsertMediaAtCursor
    , closeModal = CloseMediaPicker
    }



-- UPDATE


decodeGeneration : D.Decoder ( Int, Int )
decodeGeneration =
    D.map2 Tuple.pair (D.field "md" D.int) (D.field "style" D.int)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotConvertedHtml html ->
            ( { model | exposition = Exposition.withHtml model.exposition html }
            , setPreviewContent html
            )

        EditGeneration val ->
            case D.decodeValue decodeGeneration val of
                Ok gen ->
                    if gen /= model.editGeneration then
                        ( { model
                            | editGeneration = gen
                            , exposition = incContentVersion model.exposition
                            , saved = False
                          }
                        , getContent ()
                        )

                    else
                        ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        MdContent val ->
            case
                ( D.decodeValue (D.field "generation" decodeGeneration) val
                , D.decodeValue (D.field "md" D.string) val
                , D.decodeValue (D.field "style" D.string) val
                )
            of
                ( Ok gen, Ok mdcontent, Ok stylecontent ) ->
                    let
                        newHtml =
                            Exposition.insertToolHtml mdcontent model.exposition
                    in
                    ( { model
                        | editGeneration = gen
                        , exposition =
                            Exposition.withCSS
                                (Exposition.withHtml
                                    (Exposition.withMd model.exposition mdcontent)
                                    newHtml
                                )
                                stylecontent
                      }
                    , convertMarkdown newHtml
                    )

                _ ->
                    ( model, Cmd.none )

        CMOpenMediaDialog val ->
            case D.decodeValue (D.field "media" D.string) val of
                Ok mediaNameOrId ->
                    update (MediaDialog mediaNameOrId) model

                Err _ ->
                    let
                        _ =
                            Debug.log "no mediaName or ID" val
                    in
                    ( addProblem model Problems.CannotFindMediaFieldInJson, Cmd.none )

        MediaDialog mediaNameOrId ->
            case Exposition.objectByNameOrId mediaNameOrId model.exposition of
                Just obj ->
                    let
                        viewObjectState =
                            Exposition.validateMediaObject model.exposition obj obj
                    in
                    ( { model
                        | mediaDialog =
                            ( Modal.shown
                            , Just ( obj, obj.id )
                            , Just viewObjectState
                            )
                      }
                    , Cmd.none
                    )

                Nothing ->
                    let
                        modelWithProblem =
                            addProblem model Problems.NoMediaWithNameOrId
                    in
                    let
                        _ =
                            Debug.log "no object" model
                    in
                    ( { modelWithProblem
                        | mediaDialog = ( Modal.hidden, Nothing, Nothing )
                      }
                    , Cmd.none
                    )

        CloseMediaDialog ->
            ( { model | mediaDialog = ( Modal.hidden, Nothing, Nothing ) }, Cmd.none )

        GotExposition exp ->
            case exp of
                Ok e ->
                    let
                        newExposition =
                            RCAPI.toRCExposition e model.research model.weave

                        _ =
                            Debug.log "loaded: " newExposition

                        newModel =
                            { model
                                | exposition = newExposition
                                , mediaClassesDict = RCAPI.toMediaClassesDict e
                            }
                    in
                    ( newModel
                    , Cmd.batch [ updateEditorContent newModel, RCAPI.getMediaList model.research GotMediaList ]
                    )

                Err err ->
                    let
                        _ =
                            Debug.log "could not load exposition: " err
                    in
                    ( model, Cmd.none )

        SaveExposition ->
            let
                modelWithToc =
                    { model | exposition = Exposition.updateToc model.exposition }
            in
            if not model.saved then
                ( modelWithToc, RCAPI.saveExposition modelWithToc.exposition SavedExposition )

            else
                ( modelWithToc, Cmd.none )

        SavedExposition result ->
            case result of
                Ok r ->
                    let
                        _ =
                            Debug.log "save result: " r
                    in
                    ( { model | saved = True }, Cmd.none )

                Err s ->
                    let
                        _ =
                            Debug.log "save error: " s
                    in
                    ( addProblem model Problems.CannotSave, Cmd.none )

        GotMediaList mediaResult ->
            case mediaResult of
                Err e ->
                    let
                        _ =
                            Debug.log "media list loading issue: " e
                    in
                    ( addProblem model (Problems.CannotLoadMedia "http request failed")
                    , Cmd.none
                    )

                Ok media ->
                    let
                        _ =
                            Debug.log "loaded media: " media
                    in
                    let
                        ( problems, mediaEntries ) =
                            Problems.splitResultList
                                (List.map (RCAPI.toRCMediaObject model.research) media)

                        modelWithProblems =
                            addProblems model problems

                        expositionWithMedia =
                            List.foldr Exposition.addOrReplaceObject modelWithProblems.exposition mediaEntries

                        expositionWithClasses =
                            Exposition.renameDuplicateMedia <|
                                addMediaUserClasses expositionWithMedia model.mediaClassesDict

                        _ =
                            Debug.log "loaded exposition with media: " expositionWithClasses
                    in
                    ( { modelWithProblems
                        | exposition = expositionWithClasses
                      }
                    , Cmd.batch
                        ([ setContent
                            (E.object
                                [ ( "md"
                                  , E.string expositionWithClasses.markdownInput
                                  )
                                , ( "style", E.string expositionWithClasses.css )
                                ]
                            )
                         , setPreviewContent expositionWithClasses.renderedHtml
                         ]
                            ++ List.map (\o -> RCAPI.updateMedia o (Http.expectString SavedMediaEdit))
                                expositionWithClasses.media
                        )
                    )

        MediaEdit ( objInModelName, objFromDialog ) ->
            case Exposition.objectByNameOrId objInModelName model.exposition of
                Nothing ->
                    let
                        modelWithProblem =
                            addProblem model Problems.NoMediaWithNameOrId
                    in
                    ( modelWithProblem, Cmd.none )

                Just objInModel ->
                    let
                        viewObjectState =
                            Exposition.validateMediaObject model.exposition objInModel objFromDialog

                        ( viewStatus, objInEdit, _ ) =
                            model.mediaDialog
                    in
                    case Exposition.isValid viewObjectState.validation of
                        False ->
                            ( { model
                                | mediaDialog = ( viewStatus, Just ( objFromDialog, objInModel.id ), Just viewObjectState )
                              }
                            , Cmd.none
                            )

                        True ->
                            let
                                newModel =
                                    { model
                                        | mediaDialog =
                                            ( viewStatus, Just ( objFromDialog, objInModel.id ), Just viewObjectState )
                                        , exposition =
                                            Exposition.replaceObject objFromDialog model.exposition
                                    }
                            in
                            update (SaveMediaEdit objFromDialog) newModel

        SaveMediaEdit obj ->
            ( model
            , RCAPI.updateMedia obj (Http.expectString SavedMediaEdit)
            )

        SavedMediaEdit result ->
            case result of
                Ok s ->
                    let
                        _ =
                            Debug.log "saved media result: " s
                    in
                    update SaveExposition model

                Err s ->
                    let
                        _ =
                            Debug.log "update media error: " s
                    in
                    ( addProblem model Problems.CannotUpdateMedia, Cmd.none )

        MediaDelete obj ->
            let
                modelWithoutObj =
                    { model | exposition = Exposition.removeObjectWithID obj.id model.exposition }
            in
            ( modelWithoutObj, Cmd.batch [ RCAPI.deleteMedia obj MediaDeleted, RCAPI.getMediaList model.research GotMediaList ] )

        MediaDeleted obj ->
            update CloseConfirmDialog model

        UploadMediaFileSelect ->
            -- alowed media types:
            ( model
            , Select.file
                [ "image/jpeg"
                , "image/png"
                , "image/gif"
                , "image/tiff"
                , "image/svg+xml"
                , "audio/mp3"
                , "audio/wav"
                , "audio/aiff"
                , "application/pdf"
                , "audio/ogg"
                , "audio/aif"
                , "video/mp4"
                , "video/mpeg"
                , "video/ogv"
                ]
                UploadMediaFileSelected
            )

        UploadMediaFileSelected file ->
            ( model
            , RCAPI.uploadMedia model.research (Exposition.mkMediaName model.exposition) file (Http.expectString Uploaded) BadUploadFileType
            )

        UploadImportFileSelect ->
            ( model
            , Select.file
                [ "application/vnd.oasis.opendocument.text"
                , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                , "application/x-tex"
                , "text/plain"
                , "text/html"
                , "application/xhtml+xml"
                , "text/markdown"
                , "text/x-markdown"
                , "text/x-org"
                ]
                UploadImportFileSelected
            )

        UploadImportFileSelected file ->
            ( model
            , RCAPI.uploadImport model.research file UploadedImport
            )

        DownloadExport ctype ->
            ( model, RCAPI.convertExposition ctype model.exposition )

        GotMediaUploadProgress progress ->
            case progress of
                Http.Sending p ->
                    ( { model | mediaUploadStatus = Uploading (Http.fractionSent p) }, Cmd.none )

                Http.Receiving _ ->
                    ( model, Cmd.none )

        GotImportUploadProgress progress ->
            case progress of
                Http.Sending p ->
                    ( { model | importUploadStatus = Uploading (Http.fractionSent p) }, Cmd.none )

                Http.Receiving _ ->
                    ( model, Cmd.none )

        Uploaded result ->
            case result of
                Ok _ ->
                    let
                        _ =
                            Debug.log "uploaded result: " result
                    in
                    ( { model | mediaUploadStatus = Ready }, RCAPI.getMediaList model.research GotMediaList )

                Err e ->
                    -- TODO: add problem
                    let
                        _ =
                            Debug.log "error uploading: " e
                    in
                    ( model, Cmd.none )

        UploadedImport result ->
            case result of
                Ok importResult ->
                    let
                        _ =
                            Debug.log "import result: " importResult

                        newModel =
                            { model
                                | importUploadStatus = Ready
                                , exposition =
                                    Exposition.withMd model.exposition
                                        (Exposition.replaceImagesWithTools
                                            (model.exposition.markdownInput ++ importResult.markdown)
                                            importResult.media
                                        )
                            }
                    in
                    ( newModel
                    , Cmd.batch
                        [ updateEditorContent newModel
                        , RCAPI.getMediaList model.research GotMediaList
                        ]
                    )

                Err e ->
                    let
                        _ =
                            Debug.log "error uploading: " e
                    in
                    ( addProblem model (Problems.CannotImportFile e), Cmd.none )

        ConfirmMediaDelete object ->
            let
                content =
                    { prompt = object.name ++ " is about to be deleted. Are you sure?"
                    , confirm = "Delete"
                    , reject = "Keep"
                    }

                messages =
                    { confirm = MediaDelete object
                    , reject = CloseConfirmDialog
                    }
            in
            ( { model | confirmDialog = ( Modal.shown, Just content, Just messages ) }, Cmd.none )

        CloseConfirmDialog ->
            ( { model | confirmDialog = ( Modal.hidden, Nothing, Nothing ) }, Cmd.none )

        SwitchTab tab ->
            let
                ( _, mdEditor ) =
                    model.editor

                newModel =
                    { model | editor = ( tab, mdEditor ) }
            in
            ( newModel, Cmd.batch [ RCAPI.getMediaList model.research GotMediaList, enumTabState (getTabState newModel.editor) |> setEditor ] )

        AlertMsg visibility ->
            ( { model | alertVisibility = visibility }, Cmd.none )

        SwitchMarkdownEditor editor ->
            -- using the toggle
            let
                ( tab, _ ) =
                    model.editor

                newModel =
                    { model | editor = ( tab, editor ) }
            in
            ( newModel, enumTabState (getTabState newModel.editor) |> setEditor )

        InsertMediaAtCursor obj ->
            let
                foundObj =
                    Exposition.objectByNameOrId (String.fromInt obj.id) model.exposition

                _ =
                    Debug.log "trying to insert:" foundObj
            in
            ( { model | mediaPickerDialog = Modal.hidden }
              -- close mediapicker if insert
              -- this is simply to make sure the object is in the exposition media
            , case foundObj of
                Just o ->
                    insertMdString ( "!{" ++ o.name ++ "}", 0 )

                Nothing ->
                    Cmd.none
            )

        InsertAtCursor insertTuple ->
            ( model, insertMdString insertTuple )

        OpenMediaPicker ->
            ( { model | mediaPickerDialog = Modal.shown }, Cmd.none )

        CloseMediaPicker ->
            ( { model | mediaPickerDialog = Modal.hidden }, Cmd.none )

        ExportDropMsg state ->
            ( { model | exportDropState = state }
            , Cmd.none
            )

        BadUploadFileType str ->
            ( addProblem model (Problems.UnkownUploadFileType str), Cmd.none )


viewUpload : Icon -> Bool -> Msg -> String -> UploadStatus -> Html Msg
viewUpload icon needsOffset onClickMsg buttonText status =
    case status of
        Ready ->
            mkButton icon needsOffset onClickMsg buttonText True [ Spacing.mb1, Spacing.mt1, Spacing.mr1 ] False

        Uploading fraction ->
            div [ class "upload-percentage" ] [ text (String.fromInt (round (100 * fraction)) ++ "%") ]


enumTabState : TabState -> Int
enumTabState t =
    case t of
        CmMarkdownTab ->
            0

        TxtMarkdownTab ->
            1

        StyleTab ->
            2

        MediaListTab ->
            3


viewTabs : Model -> Html Msg
viewTabs model =
    let
        tabLink : EditorType -> String -> Html Msg
        tabLink tab title =
            let
                selectedClass =
                    if Tuple.first model.editor == tab then
                        "nav-link active"

                    else
                        "nav-link"
            in
            li [ class "nav-item" ]
                [ a [ class selectedClass, href "#", onClick (SwitchTab tab) ] [ text title ]
                ]
    in
    ul [ class "nav nav-tabs" ]
        [ tabLink EditorMarkdown "Markdown"
        , tabLink EditorMedia "Media browser"
        , tabLink EditorStyle "Style"
        ]


viewAlert : Model -> Html Msg
viewAlert model =
    let
        message =
            case model.problems of
                [] ->
                    "test - no problem :-)"

                problems ->
                    String.join " " <| List.map Problems.asString problems
    in
    Alert.config
        |> Alert.info
        |> Alert.dismissable AlertMsg
        |> Alert.children
            [ Alert.h4 [] [ text "there is a problem" ]
            , text <| message
            ]
        |> Alert.view model.alertVisibility


viewEditorCheckbox : MarkdownEditor -> Html Msg
viewEditorCheckbox markdownEditor =
    let
        onToggle : Bool -> Msg
        onToggle becomesChecked =
            if becomesChecked then
                SwitchMarkdownEditor TextareaMarkdown

            else
                SwitchMarkdownEditor CodemirrorMarkdown
    in
    Checkbox.checkbox
        [ Checkbox.onCheck onToggle
        , Checkbox.checked <| markdownEditor == TextareaMarkdown
        , Checkbox.attrs [ class "editor-checkbox" ]
        ]
        "Plain text"


viewLink : String -> String -> Html Msg
viewLink name url =
    a
        [ href url
        , class "btn btn-link ml-1"
        ]
        [ text name ]


editorToolbar : List (Html Msg)
editorToolbar =
    [ mkButton NoIcon False (InsertAtCursor (Settings.snippet Settings.H1)) "H1" False [] False
    , mkButton NoIcon False (InsertAtCursor (Settings.snippet Settings.H2)) "H2" False [] False
    , mkButton NoIcon False (InsertAtCursor (Settings.snippet Settings.H3)) "H3" False [] False
    , mkButton BoldIcon False (InsertAtCursor (Settings.snippet Settings.Bold)) "" False [] False
    , mkButton ItalicIcon False (InsertAtCursor (Settings.snippet Settings.Italic)) "" False [] False
    , mkButton ListIcon False (InsertAtCursor (Settings.snippet Settings.Bullet)) "" False [] False
    , mkButton NumberedIcon False (InsertAtCursor (Settings.snippet Settings.Numbered)) "" False [] False
    , mkButton LinkIcon False (InsertAtCursor (Settings.snippet Settings.Link)) "" False [] False
    , mkButton QuoteIcon False (InsertAtCursor (Settings.snippet Settings.Quote)) "" False [] False
    ]


view : Model -> Html Msg
view model =
    let
        mediaDialogHtml =
            case model.mediaDialog of
                ( vis, Just ( obj, objId ), Just valid ) ->
                    RCMediaEdit.viewMediaDialog makeMediaEditFun CloseMediaDialog model.exposition ( vis, ( obj, objId ), valid )

                _ ->
                    div [] []

        confirmDialogHtml =
            case model.confirmDialog of
                ( visibility, Just content, Just messages ) ->
                    UserConfirm.view visibility content messages

                ( _, _, _ ) ->
                    div [] []

        saveButtonText =
            if model.saved then
                "Saved"

            else
                "Not Saved"

        saveButton =
            Button.button
                [ Button.light
                , Button.attrs [ onClick SaveExposition ]
                ]
                [ renderIcon SaveIcon, text saveButtonText ]

        mediaList =
            RCMediaList.view model.exposition.media makeTableMessages

        alert =
            case model.problems of
                [] ->
                    span [] []

                _ ->
                    viewAlert model

        editorCheckbox =
            case model.editor of
                ( EditorMarkdown, markdownEditor ) ->
                    viewEditorCheckbox markdownEditor

                _ ->
                    span [] []

        previewButton =
            let
                researchId =
                    model.exposition.id

                weave =
                    model.exposition.currentWeave

                previewUrl =
                    String.join "/" [ "view", String.fromInt researchId, String.fromInt weave ]
            in
            a
                [ href previewUrl
                , Html.Attributes.target "_blank"
                , class "btn btn-outline-dark"
                ]
                [ renderIcon EyeIcon
                ]
    in
    div []
        [ viewTabs model
        , mediaDialogHtml
        , confirmDialogHtml
        , RCMediaList.viewModalMediaPicker model.mediaPickerDialog model.exposition.media makePickerMessages
        , div [ class "btn-toolbar", attribute "role" "toolbar" ]
            [ viewUpload UploadCloud True UploadMediaFileSelect "Upload media" model.mediaUploadStatus
            , mkButton ArrowDown
                True
                OpenMediaPicker
                "Insert media"
                True
                []
                (not
                    (selectedEditorIsMarkdown model)
                )
            , viewUpload ImportIcon True UploadImportFileSelect "Import doc" model.importUploadStatus
            , mkDropdown model.exportDropState
                ExportDropMsg
                "Export doc"
                [ ( "doc", DownloadExport RCAPI.Docx )
                , ( "pdf", DownloadExport RCAPI.Pdf )
                , ( "epub", DownloadExport RCAPI.Epub )
                , ( "odt", DownloadExport RCAPI.Odt )
                , ( "latex", DownloadExport RCAPI.Latex )
                , ( "html", DownloadExport RCAPI.Html )
                , ( "markdown", DownloadExport RCAPI.Md )
                ]
            ]
        , div [ class "toolbar" ] <|
            List.append
                editorToolbar
                [ editorCheckbox ]
        , saveButton
        , alert
        , mediaList
        , div [ class "navigation-links" ]
            [ previewButton
            , viewLink "profile" "profile"
            , viewLink "logout" "session/logout"
            ]
        ]
