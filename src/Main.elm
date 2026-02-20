port module Main exposing (Msg(..), main, update, view)

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Dropdown as Dropdown
import Bootstrap.Form as Form
import Bootstrap.Form.Checkbox as Checkbox
import Bootstrap.Grid as Grid
import Bootstrap.Modal as Modal
import Bootstrap.Navbar as Navbar
import Bootstrap.Utilities.Spacing as Spacing
import Browser
import Browser.Navigation as Nav
import Bytes
import Dict
import Exposition exposing (RCExposition, RCMediaObject, RCMediaObjectViewState, addMediaUserClasses, incContentVersion)
import File exposing (File)
import File.Select as Select
import FileTypes
import FootnoteHelper
import Html exposing (Html, a, button, div, img, li, p, span, text, ul)
import Html.Attributes exposing (attribute, class, classList, for, href, id, src, style, title)
import Html.Events exposing (on, onCheck, onClick, onInput, preventDefaultOn)
import Http
import Json.Decode as D
import Json.Encode as E
import Licenses
import List.Extra exposing (uniqueBy)
import Problems
import RCAPI
import RCMediaEdit
import RCMediaList
import Regex
import Settings exposing (BuildType)
import Snippets exposing (..)
import String.Extra as Str
import Time
import UserConfirm exposing (ConfirmDialogContent)
import Util
import View exposing (..)


type alias Model =
    { exposition : RCExposition
    , editGeneration : ( Int, Int )
    , mediaDialog : RCMediaEdit.Model
    , mediaList : RCMediaList.Model
    , confirmDialog : UserConfirm.Model Msg
    , mediaPickerDialog : ( RCMediaList.Model, Modal.Visibility )
    , alertVisibility : Alert.Visibility
    , weave : Int
    , research : Int
    , mediaUploadStatus : UploadStatus
    , importUploadStatus : UploadStatus
    , problems : List Problems.Problem
    , mediaClassesDict : Dict.Dict Int String -- stores userclasses for media to be added to media list
    , saved : SaveState
    , editor : ( EditorType, MarkdownEditor )
    , exportDropState : Dropdown.State
    , navbarState : Navbar.State
    , fullscreenMode : Bool
    , buildTarget : BuildType
    , version : String
    }


type SaveState
    = Saved
    | Unsaved
    | UnsavedEmpty


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


selectedEditorIsStyle : Model -> Bool
selectedEditorIsStyle model =
    case model.editor of
        ( EditorStyle, _ ) ->
            True

        _ ->
            False


selectedEditorIsMedia : Model -> Bool
selectedEditorIsMedia model =
    case model.editor of
        ( EditorMedia, _ ) ->
            True

        _ ->
            False


isMediaPickerVisible : Model -> Bool
isMediaPickerVisible model =
    let
        vis =
            Tuple.second model.mediaPickerDialog
    in
    if vis == Modal.shown then
        True

    else
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


editorNumber : TabState -> Int
editorNumber tab =
    case tab of
        CmMarkdownTab ->
            0

        TxtMarkdownTab ->
            1

        StyleTab ->
            2

        MediaListTab ->
            3


type MediaInsertMethod
    = FullMedia
    | OnlyTheLink


type alias Flags =
    { weave : Int, research : Int, buildTarget : BuildType, version : String }


decodeFlags : D.Decoder Flags
decodeFlags =
    D.map3
        (\(  research, weave ) buildTarget version -> Flags weave research buildTarget version)
        (D.field "locationpath" D.string |> D.andThen parseEditorPath)
        (D.map Settings.buildTypeFromString (D.field "buildTarget" D.string))
        (D.field "version" D.string)


parseEditorPath : String -> D.Decoder ( Int, Int )
parseEditorPath path =
    case String.split "/" path of
        [ "", "editor", first, second ] ->
            case Maybe.map2 Tuple.pair (String.toInt first) (String.toInt second) of
                Just pair ->
                    D.succeed pair

                Nothing ->
                    D.fail ("Invalid numbers in path: " ++ path)

        _ ->
            let
                _ =
                    Debug.log "path =" path
            in
            D.fail ("Could not parse editor path: " ++ path)


emptyModel : String -> Navbar.State -> BuildType -> Int -> Int -> Model
emptyModel version navbarInitState buildType research weave =
    { editGeneration = ( -1, -1 )
    , exposition = Exposition.empty
    , mediaList = RCMediaList.empty
    , mediaDialog = RCMediaEdit.empty
    , confirmDialog = UserConfirm.empty
    , mediaPickerDialog = ( RCMediaList.empty, Modal.hidden )
    , alertVisibility = Alert.closed
    , research = research
    , weave = weave
    , mediaUploadStatus = Ready
    , importUploadStatus = Ready
    , problems = []
    , mediaClassesDict = Dict.empty
    , saved = Saved
    , editor = ( EditorMarkdown, CodemirrorMarkdown )
    , exportDropState = Dropdown.initialState
    , navbarState = navbarInitState
    , fullscreenMode = False
    , buildTarget = buildType
    , version = version
    }


init : D.Value -> ( Model, Cmd Msg )
init flags =
    let
        ( navbarState, navCmd ) =
            Navbar.initialState NavbarMsg
    in
    case D.decodeValue decodeFlags flags of
        Ok fl ->
            ( emptyModel fl.version navbarState fl.buildTarget fl.research fl.weave
            , Cmd.batch [ navCmd, RCAPI.getExposition fl.research fl.weave GotExposition ]
            )

        Err e ->
            let
                decoderError =
                    D.errorToString e
            in
            ( Problems.addProblem (emptyModel "" navbarState Settings.defaultBuildType -1 -1) (Problems.WrongExpositionUrl decoderError)
            , Cmd.none
            )



-- addProblem : Model -> Problems.Problem -> Model
-- addProblem model problem =
--     { model | problems = problem :: model.problems, alertVisibility = Alert.shown }
-- addProblems : Model -> List Problems.Problem -> Model
-- addProblems model problems =
--     { model | problems = problems ++ model.problems, alertVisibility = Alert.shown }


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- PORTS
-- general
-- code mirror markdown


port currentGeneration : (E.Value -> msg) -> Sub msg


port cmContent : (E.Value -> msg) -> Sub msg


port getContent : () -> Cmd msg


port setContent : E.Value -> Cmd msg


port reportIsSaved : Bool -> Cmd msg


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



-- Elm to Javascript


port setEditor : Int -> Cmd msg


port insertMdString : ( String, Int ) -> Cmd msg


port insertFootnote :
    ( String, String )
    -> Cmd msg -- number, content


port cmUndo : () -> Cmd msg


port cmRedo : () -> Cmd msg


port setDocumentTitle : String -> Cmd msg


port setFullscreenMode : Bool -> Cmd msg



--- markdown conversion using marked


port convertMarkdown : String -> Cmd msg


port setPreviewContent : String -> Cmd msg



-- Javascript to Elm


port getHtml : ({ html : String, toc : List ( String, String, String ) } -> msg) -> Sub msg


port mediaDialog : (E.Value -> msg) -> Sub msg


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
        , Time.every 10000 (\_ -> AutosaveTrigger)
        , Navbar.subscriptions model.navbarState NavbarMsg
        ]



-- MESSAGES


type Msg
    = EditGeneration E.Value
    | MdContent E.Value
    | MediaDialog RCMediaEdit.DialogType String
    | CMOpenMediaDialog E.Value
    | GotConvertedHtml { html : String, toc : List ( String, String, String ) }
    | MediaEdit ( String, Exposition.RCMediaObject )
    | MediaList (RCMediaList.Msg Msg)
    | MediaDelete Exposition.RCMediaObject
    | CloseMediaDialog
    | GotExposition (Result Http.Error RCAPI.APIExposition)
    | GotMediaList (Result Http.Error (List RCAPI.APIMediaEntry))
    | OpenNewMediaGotMediaList String (Result Http.Error (List RCAPI.APIMediaEntry))
    | UploadMediaFileSelect
    | UploadMediaFileSelected File
    | UploadImportFileSelect
    | UploadImportFileSelected File
    | GotMediaUploadProgress Http.Progress
    | GotImportUploadProgress Http.Progress
    | Uploaded (Result Http.Error String)
    | UploadedImport (Result Http.Error RCAPI.APIPandocImport)
    | SaveTrigger
    | AutosaveTrigger
    | SaveEmptyExposition
    | SavedExposition (Result Http.Error String)
    | SaveMediaEdit Exposition.RCMediaObject
    | SavedMediaEdit (Result Http.Error String)
    | ConfirmMediaDelete Exposition.RCMediaObject
    | CloseConfirmDialog
    | SwitchTab EditorType
    | NavbarMsg Navbar.State
    | MediaDeleted (Result Http.Error ())
    | AlertMsg Alert.Visibility
    | DismissAllProblems
    | SwitchMarkdownEditor MarkdownEditor
    | DownloadExport RCAPI.ConversionType (Result Http.Error Bytes.Bytes)
    | ConvertExposition RCAPI.ConversionType
    | InsertAtCursor ( String, Int ) -- string and cursor offset after insert
    | InsertFootnoteAtCursor
    | InsertMediaAtCursor RCMediaObject
    | InsertMediaAsLinkAtCursor RCMediaObject
    | OpenMediaPicker
    | CloseMediaPicker
    | MediaPicker (RCMediaList.Msg Msg)
    | ExportDropMsg Dropdown.State
    | BadUploadFileType String
    | UndoCM
    | RedoCM
    | SetDocumentTitle String
    | ToggleFullscreen Bool


makeMediaEditFun : Exposition.RCMediaObject -> RCMediaEdit.Field -> String -> Msg
makeMediaEditFun obj field input =
    let
        objId =
            .id obj
    in
    case field of
        RCMediaEdit.Name ->
            MediaEdit ( String.fromInt objId, { obj | name = input } )

        RCMediaEdit.Description ->
            MediaEdit ( String.fromInt objId, { obj | description = input } )

        RCMediaEdit.UserClass ->
            MediaEdit ( String.fromInt objId, { obj | userClass = input } )

        RCMediaEdit.Copyright ->
            MediaEdit ( String.fromInt objId, { obj | copyright = input } )

        RCMediaEdit.LicenseField ->
            MediaEdit ( String.fromInt objId, { obj | license = Licenses.fromString input } )


makeTableMessages : Html Msg -> RCMediaList.TableEditConfig Msg
makeTableMessages uploadButtonHtml =
    { editObject = MediaDialog RCMediaEdit.WithoutInsertButton
    , deleteObject = ConfirmMediaDelete
    , insertObject = InsertMediaAtCursor
    , insertObjectAsLink = InsertMediaAsLinkAtCursor
    , uploadButtonHtml = uploadButtonHtml
    }


makePickerConfig : Html Msg -> RCMediaList.PickerConfig Msg
makePickerConfig uploadButtonHtml =
    { uploadButtonHtml = uploadButtonHtml
    , insertObject = InsertMediaAtCursor
    , insertObjectAsLink = InsertMediaAsLinkAtCursor
    , closeModal = CloseMediaPicker
    }



-- UPDATE


forceRerender : Model -> ( Model, Cmd Msg )
forceRerender model =
    let
        newHtml =
            Exposition.insertToolHtml model.exposition.markdownInput model.exposition
    in
    ( { model
        | exposition =
            Exposition.withCSS
                (Exposition.withHtml
                    (Exposition.withMd model.exposition model.exposition.markdownInput)
                    newHtml
                )
                model.exposition.css
      }
    , convertMarkdown newHtml
    )


decodeGeneration : D.Decoder ( Int, Int )
decodeGeneration =
    D.map2 Tuple.pair (D.field "md" D.int) (D.field "style" D.int)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotConvertedHtml convObj ->
            ( { model | exposition = Exposition.updateToc (Exposition.withHtml model.exposition convObj.html) convObj.toc }
            , setPreviewContent convObj.html
            )

        EditGeneration val ->
            case D.decodeValue decodeGeneration val of
                Ok gen ->
                    if gen /= model.editGeneration then
                        ( { model
                            | editGeneration = gen
                            , exposition = incContentVersion model.exposition
                            , saved = Unsaved
                          }
                        , Cmd.batch [ reportIsSaved False, getContent () ]
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
                        expoCaptions =
                            Exposition.parseToolCaptions mdcontent model.exposition

                        newHtml =
                            Exposition.insertToolHtml mdcontent expoCaptions
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
                    ( RCMediaEdit.update model (RCMediaEdit.ShowMediaWithId RCMediaEdit.WithoutInsertButton mediaNameOrId), Cmd.none )

                Err _ ->
                    ( Problems.addProblem model Problems.CannotFindMediaFieldInJson, Cmd.none )

        MediaDialog dialogType mediaNameOrId ->
            ( RCMediaEdit.update model (RCMediaEdit.ShowMediaWithId dialogType mediaNameOrId), Cmd.none )

        CloseMediaDialog ->
            forceRerender { model | mediaDialog = RCMediaEdit.empty }

        GotExposition exp ->
            case exp of
                Ok e ->
                    let
                        newExposition =
                            RCAPI.toRCExposition e model.research model.weave

                        mediaClassesDict =
                            RCAPI.toMediaClassesDict e

                        newModel =
                            case mediaClassesDict of
                                Ok dict ->
                                    { model
                                        | exposition = newExposition
                                        , mediaClassesDict = dict
                                    }

                                Err emptyDict ->
                                    let
                                        problemModel =
                                            Problems.addProblem model Problems.MediaUserClassesProblem
                                    in
                                    { problemModel
                                        | exposition = newExposition
                                        , mediaClassesDict = emptyDict
                                    }
                    in
                    ( newModel
                    , Cmd.batch
                        [ updateEditorContent newModel
                        , RCAPI.getMediaList model.research GotMediaList
                        , setDocumentTitle newModel.exposition.title
                        ]
                    )

                Err err ->
                    ( Problems.addProblem model <| Problems.CannotLoadExposition err, Cmd.none )

        SaveTrigger ->
            let
                expo =
                    model.exposition

                -- safety, do not save the empty expo without asking :-)
                empty =
                    Exposition.isEmpty expo
            in
            case ( empty, model.saved ) of
                ( False, Saved ) ->
                    ( model, Cmd.none )

                ( True, Saved ) ->
                    ( model, Cmd.none )

                ( True, UnsavedEmpty ) ->
                    ( { model
                        | confirmDialog = confirmSavingEmptyExposition expo
                      }
                    , Cmd.none
                    )

                ( True, Unsaved ) ->
                    ( { model
                        | confirmDialog = confirmSavingEmptyExposition expo
                        , saved = UnsavedEmpty
                      }
                    , Cmd.none
                    )

                ( False, _ ) ->
                    ( model, RCAPI.saveExposition expo SavedExposition )

        AutosaveTrigger ->
            let
                -- safety, do not save the empty expo without asking :-)
                empty =
                    Exposition.isEmpty model.exposition
            in
            case ( model.saved, empty ) of
                ( Unsaved, False ) ->
                    ( model, RCAPI.saveExposition model.exposition SavedExposition )

                ( Unsaved, True ) ->
                    ( { model | saved = UnsavedEmpty }, Cmd.none )

                ( _, _ ) ->
                    ( model, Cmd.none )

        SaveEmptyExposition ->
            ( { model | confirmDialog = UserConfirm.empty }, RCAPI.saveExposition model.exposition SavedExposition )

        SavedExposition result ->
            case result of
                Ok r ->
                    ( { model | saved = Saved }, reportIsSaved True )

                Err s ->
                    case s of
                        Http.BadStatus 401 ->
                            ( model, Nav.reload )

                        _ ->
                            ( Problems.addProblem model Problems.CannotSave, Cmd.none )

        GotMediaList mediaResult ->
            case mediaResult of
                Err err ->
                    ( Problems.addProblem model (Problems.CannotLoadMedia err)
                    , Cmd.none
                    )

                Ok media ->
                    let
                        ( problems, mediaEntries ) =
                            Problems.splitResultList
                                (List.map (RCAPI.toRCMediaObject model.research) media)

                        modelWithProblems =
                            Problems.addProblems model problems

                        expositionWithMedia =
                            List.foldr Exposition.addOrReplaceObject modelWithProblems.exposition mediaEntries

                        expositionWithClasses =
                            Exposition.renameDuplicateMedia <|
                                addMediaUserClasses expositionWithMedia model.mediaClassesDict
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

        -- a new media file was (successfully) uploaded, immediately show edit dialog
        OpenNewMediaGotMediaList id mediaList ->
            let
                ( modelWithNewMedia, _ ) =
                    update (GotMediaList mediaList) model

                dialogType =
                    if not <| selectedEditorIsMedia model then
                        RCMediaEdit.WithInsertButton

                    else
                        RCMediaEdit.WithoutInsertButton
            in
            update (MediaDialog dialogType id) modelWithNewMedia

        MediaEdit ( objInModelName, objFromDialog ) ->
            case Exposition.objectByNameOrId objInModelName model.exposition of
                Nothing ->
                    let
                        modelWithProblem =
                            Problems.addProblem model <| Problems.NoMediaWithNameOrId objInModelName
                    in
                    ( modelWithProblem, Cmd.none )

                Just objInModel ->
                    let
                        objViewState =
                            Exposition.validateMediaObject model.exposition objInModel objFromDialog

                        dialog =
                            model.mediaDialog
                    in
                    case Exposition.isValid objViewState.validation of
                        False ->
                            ( { model
                                | mediaDialog =
                                    { dialog
                                        | object = Just objFromDialog
                                        , objectViewState = Just objViewState
                                    }
                              }
                            , Cmd.none
                            )

                        True ->
                            let
                                newModel =
                                    { model
                                        | mediaDialog = { dialog | object = Just objFromDialog, objectViewState = Just objViewState }
                                        , exposition =
                                            Exposition.replaceObject objFromDialog model.exposition
                                        , mediaClassesDict = model.mediaClassesDict |> Dict.update objFromDialog.id (Maybe.map (\_ -> objFromDialog.userClass))
                                    }
                            in
                            ( { newModel | saved = Unsaved }
                            , RCAPI.updateMedia objFromDialog (Http.expectString SavedMediaEdit)
                            )

        SaveMediaEdit obj ->
            -- no longer used
            ( { model | saved = Unsaved }
            , RCAPI.updateMedia obj (Http.expectString SavedMediaEdit)
            )

        SavedMediaEdit result ->
            case result of
                Ok s ->
                    ( model, Cmd.none )

                Err e ->
                    ( Problems.addProblem model <| Problems.CannotUpdateMedia e, Cmd.none )

        MediaDelete obj ->
            let
                modelWithoutObj =
                    { model
                        | exposition = Exposition.removeObjectWithID obj.id model.exposition
                    }

                ( modelWithClosedWindow, cmd ) =
                    update CloseConfirmDialog modelWithoutObj
            in
            ( modelWithClosedWindow, Cmd.batch [ cmd, RCAPI.deleteMedia obj MediaDeleted ] )

        MediaDeleted obj ->
            -- todo, maybe show a message that object was deleted ?
            ( model, RCAPI.getMediaList model.research GotMediaList )

        UploadMediaFileSelect ->
            ( model
            , Select.file FileTypes.strings
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
            case importHasCorrectMime file of
                Ok okfile ->
                    ( model
                    , RCAPI.uploadImport model.research okfile UploadedImport
                    )

                Err problem ->
                    ( Problems.addProblem model <| problem, Cmd.none )

        ConvertExposition ctype ->
            ( model, RCAPI.convertExposition model.buildTarget ctype model.exposition DownloadExport )

        DownloadExport ctype result ->
            case result of
                Err err ->
                    ( Problems.addProblem model <| Problems.ExportFailed, Cmd.none )

                Ok bytes ->
                    ( model, RCAPI.downloadExport ctype bytes )

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
            -- first, try to retrieve media Id from result, for the purpose of opening the media  edit window if success.
            case result of
                Ok apiMedia ->
                    let
                        decoded : Result D.Error RCAPI.APIMediaEntry
                        decoded =
                            D.decodeString RCAPI.apiMediaEntry apiMedia
                    in
                    case decoded of
                        Ok media ->
                            let
                                id =
                                    String.fromInt (.id media)

                                onGotMediaList =
                                    if isMediaPickerVisible model then
                                        GotMediaList

                                    else
                                        OpenNewMediaGotMediaList id
                            in
                            ( { model | mediaUploadStatus = Ready }, RCAPI.getMediaList model.research onGotMediaList )

                        Err e ->
                            ( Problems.addProblem model (Problems.DecodingJsonError e), RCAPI.getMediaList model.research GotMediaList )

                Err e ->
                    ( Problems.addProblem model <| Problems.MediaUploadFailed e, Cmd.none )

        UploadedImport result ->
            case result of
                Ok importResult ->
                    let
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
                    ( Problems.addProblem model (Problems.CannotImportFile e), Cmd.none )

        ConfirmMediaDelete object ->
            ( { model | confirmDialog = confirmObjectDelete object }, Cmd.none )

        CloseConfirmDialog ->
            ( { model | confirmDialog = UserConfirm.empty }, Cmd.none )

        SwitchTab tab ->
            let
                ( _, mdEditor ) =
                    model.editor

                newModel =
                    { model | editor = ( tab, mdEditor ) }
            in
            ( newModel, enumTabState (getTabState newModel.editor) |> setEditor )

        -- Cmd.batch [ RCAPI.getMediaList model.research GotMediaList,
        NavbarMsg state ->
            ( { model | navbarState = state }, Cmd.none )

        AlertMsg visibility ->
            ( { model | alertVisibility = visibility }, Cmd.none )

        DismissAllProblems ->
            ( { model | problems = [] }, Cmd.none )

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
            insertMediaUpdate FullMedia obj model

        InsertMediaAsLinkAtCursor obj ->
            insertMediaUpdate OnlyTheLink obj model

        InsertAtCursor insertTuple ->
            ( model, insertMdString insertTuple )

        InsertFootnoteAtCursor ->
            let
                nextNumber : Result String Int
                nextNumber =
                    FootnoteHelper.mdNextFootnoteNum model.exposition.markdownInput
            in
            case nextNumber of
                Ok num ->
                    ( model, insertFootnote (FootnoteHelper.footnoteSnippet num) )

                Err err ->
                    ( Problems.addProblem model (Problems.FootnoteHelperError err), Cmd.none )

        MediaList message ->
            case message of
                RCMediaList.SortableTableMessage tableMsg ->
                    -- table sorting action
                    ( { model
                        | mediaList = RCMediaList.update tableMsg model.mediaList
                      }
                    , Cmd.none
                    )

                RCMediaList.MainMessage action ->
                    -- media editing (Main.elm Msg)
                    case action of
                        MediaDialog dialogType mediaNameOrId ->
                            ( RCMediaEdit.update model (RCMediaEdit.ShowMediaWithId dialogType mediaNameOrId)
                            , Cmd.none
                            )

                        ConfirmMediaDelete object ->
                            ( { model | confirmDialog = confirmObjectDelete object }
                            , Cmd.none
                            )

                        UploadMediaFileSelect ->
                            ( model, uploadMediaFilePrompt )

                        _ ->
                            ( Problems.addProblem model <| Problems.UnsupportedMessage "Media List button is doing something unexpected", Cmd.none )

        OpenMediaPicker ->
            ( { model | mediaPickerDialog = ( Tuple.first model.mediaPickerDialog, Modal.shown ) }, Cmd.none )

        CloseMediaPicker ->
            ( { model | mediaPickerDialog = ( Tuple.first model.mediaPickerDialog, Modal.hidden ) }, Cmd.none )

        MediaPicker pickerMsg ->
            case pickerMsg of
                RCMediaList.SortableTableMessage tableMsg ->
                    let
                        ( pickerModel, visibility ) =
                            model.mediaPickerDialog
                    in
                    ( { model | mediaPickerDialog = ( RCMediaList.update tableMsg pickerModel, visibility ) }, Cmd.none )

                RCMediaList.MainMessage normalMsg ->
                    case normalMsg of
                        InsertMediaAtCursor obj ->
                            insertMediaUpdate FullMedia obj model

                        InsertMediaAsLinkAtCursor obj ->
                            insertMediaUpdate OnlyTheLink obj model

                        OpenMediaPicker ->
                            ( { model | mediaPickerDialog = ( Tuple.first model.mediaPickerDialog, Modal.shown ) }, Cmd.none )

                        CloseMediaPicker ->
                            ( { model | mediaPickerDialog = ( Tuple.first model.mediaPickerDialog, Modal.hidden ) }, Cmd.none )

                        UploadMediaFileSelect ->
                            ( model, uploadMediaFilePrompt )

                        _ ->
                            ( Problems.addProblem model <| Problems.UnsupportedMessage "media insert is doing something unexpected", Cmd.none )

        ExportDropMsg state ->
            ( { model | exportDropState = state }
            , Cmd.none
            )

        BadUploadFileType str ->
            ( Problems.addProblem model (Problems.UnkownUploadFileType str), Cmd.none )

        UndoCM ->
            ( model, cmUndo () )

        RedoCM ->
            ( model, cmRedo () )

        SetDocumentTitle title ->
            ( model, setDocumentTitle title )

        ToggleFullscreen isFull ->
            ( { model | fullscreenMode = isFull }, setFullscreenMode isFull )



-- safer because specific


confirmObjectDelete : RCMediaObject -> UserConfirm.Model Msg
confirmObjectDelete object =
    let
        content =
            Just
                { prompt = object.name ++ " is about to be deleted. Are you sure?"
                , confirm = "Delete"
                , reject = "Keep"
                }

        messages =
            Just
                { confirm = MediaDelete object
                , reject = CloseConfirmDialog
                }
    in
    UserConfirm.Model Modal.shown content messages


confirmSavingEmptyExposition : RCExposition -> UserConfirm.Model Msg
confirmSavingEmptyExposition exposition =
    let
        content =
            Just
                { prompt = "Exposition is currently empty, are you sure you want to save it without content?"
                , confirm = "Yes"
                , reject = "No"
                }

        messages =
            Just
                { confirm = SaveEmptyExposition
                , reject = CloseConfirmDialog
                }
    in
    UserConfirm.Model Modal.shown content messages


insertMediaUpdate : MediaInsertMethod -> RCMediaObject -> Model -> ( Model, Cmd Msg )
insertMediaUpdate insertMethod object model =
    let
        foundObj =
            Exposition.objectByNameOrId (String.fromInt object.id) model.exposition
    in
    case foundObj of
        Just o ->
            let
                closeMediaListIfOpen =
                    case model.editor of
                        ( EditorMedia, CodemirrorMarkdown ) ->
                            setEditor 0

                        ( EditorMedia, TextareaMarkdown ) ->
                            setEditor 1

                        _ ->
                            Cmd.none

                updatedModel =
                    { model
                        | mediaPickerDialog = ( Tuple.first model.mediaPickerDialog, Modal.hidden )
                        , mediaDialog = RCMediaEdit.empty
                    }

                mediaSnippet =
                    case insertMethod of
                        OnlyTheLink ->
                            "\n[download " ++ o.name ++ "](" ++ Exposition.mediaUrl o ++ ")\n"

                        FullMedia ->
                            "\n!{" ++ o.name ++ "}\n"
            in
            ( updatedModel
            , Cmd.batch
                [ insertMdString ( mediaSnippet, 0 )
                , closeMediaListIfOpen -- close media list
                ]
            )

        Nothing ->
            ( Problems.addProblem model <| Problems.NoMediaWithNameOrId object.name, Cmd.none )


uploadMediaFilePrompt : Cmd Msg
uploadMediaFilePrompt =
    Select.file FileTypes.strings
        UploadMediaFileSelected


viewUpload : BuildType -> ButtonInfo Msg -> UploadStatus -> Html Msg
viewUpload buildType buttonInfo status =
    case status of
        Ready ->
            mkButton buildType buttonInfo

        Uploading fraction ->
            let
                uploadStatusMessage =
                    if fraction < 0.99 then
                        String.fromInt (round (100 * fraction)) ++ "%"

                    else
                        "processing.."
            in
            let
                uploadCssClasses =
                    Util.classListFromString "upload-percentage btn btn-outline-dark m-0 mb-1 mt-1 mr-1"
            in
            div uploadCssClasses [ text uploadStatusMessage ]


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
                [ button [ class selectedClass, onClick (SwitchTab tab) ] [ text title ]
                ]
    in
    ul [ class "nav nav-tabs" ]
        [ tabLink EditorMarkdown "Markdown"
        , tabLink EditorMedia "Media browser"
        , tabLink EditorStyle "Style"
        ]


type alias NavbarItemProps =
    { link : String
    , icon : String -- is a filename
    , title : String
    , spacing : Html.Attribute Msg
    }


viewNavbarItem : BuildType -> NavbarItemProps -> Navbar.CustomItem Msg
viewNavbarItem buildType props =
    Navbar.customItem
        (a
            [ props.spacing, href props.link, Html.Attributes.target "_blank" ]
            [ img
                [ src (Settings.iconUrl buildType ++ props.icon)
                , class "d-inline-block align-top"
                , style "width" "25px"
                , Html.Attributes.title props.title
                ]
                []
            ]
        )


viewPreviewNavbarItem : SaveState -> BuildType -> NavbarItemProps -> Navbar.CustomItem Msg
viewPreviewNavbarItem saveState buildType props =
    let
        unsavedprops =
            [ onClick SaveTrigger, class "opacity-4", Html.Attributes.title "preview of unsaved content, forcing save" ]

        saveExpositionAttrs =
            case saveState of
                Saved ->
                    [ Html.Attributes.title props.title ]

                Unsaved ->
                    unsavedprops

                UnsavedEmpty ->
                    unsavedprops
    in
    Navbar.customItem
        (a
            [ props.spacing, href props.link, Html.Attributes.target "_blank" ]
            [ img
                ([ src (Settings.iconUrl buildType ++ props.icon)
                 , class "d-inline-block align-top"
                 , style "width" "25px"
                 ]
                    ++ saveExpositionAttrs
                )
                []
            ]
        )


viewNavbar : BuildType -> Model -> Html Msg
viewNavbar buildType model =
    let
        navItem =
            viewNavbarItem buildType

        tabLink : EditorType -> List (Html.Attribute Msg)
        tabLink tab =
            let
                selectedClass =
                    if Tuple.first model.editor == tab then
                        "nav-link active"

                    else
                        "nav-link"
            in
            [ class selectedClass, preventDefaultOn "click" (D.succeed ( SwitchTab tab, True )), style "cursor" "pointer" ]

        previewUrl =
            String.join "/" [ "view", String.fromInt model.exposition.id, String.fromInt model.exposition.currentWeave ]

        metaDataUrl =
            "profile/show-exposition?exposition=" ++ String.fromInt model.exposition.id
    in
    Navbar.attrs [ Html.Attributes.style "padding-left" "0" ] (Navbar.config NavbarMsg)
        |> Navbar.withAnimation
        |> Navbar.collapseMedium
        |> Navbar.items
            [ Navbar.itemLink (Spacing.ml0 :: tabLink EditorMarkdown) [ text "Markdown" ]
            , Navbar.itemLink (tabLink EditorMedia) [ text "Media" ]
            , Navbar.itemLink (tabLink EditorStyle) [ text "Style" ]
            ]
        |> Navbar.customItems
            [ navItem { link = "https://guide.researchcatalogue.net/#text-based-editor", icon = "question.svg", title = "Help", spacing = Spacing.ml0 }
            , navItem { link = metaDataUrl, icon = "pencil.svg", title = "Show/edit metadata", spacing = Spacing.ml3 }
            , viewPreviewNavbarItem model.saved buildType { link = previewUrl, icon = "eye_metro.svg", title = "Preview", spacing = Spacing.ml3 }
            , navItem { link = "profile", icon = "profile_metro.svg", title = "Profile", spacing = Spacing.ml3 }
            , navItem { link = "session/logout", icon = "logout_metro.svg", title = "Logout", spacing = Spacing.ml3 }
            ]
        |> Navbar.view model.navbarState


viewAlert : Model -> Html Msg
viewAlert model =
    let
        isRealProblem problem =
            case problem of
                Problems.NoMediaWithNameOrId _ ->
                    False

                _ ->
                    True

        realProblems =
            List.filter isRealProblem model.problems

        uniqueProblems =
            uniqueBy Problems.asString realProblems
    in
    case uniqueProblems of
        [] ->
            div [ style "display" "none" ] []

        problems ->
            let
                problemString =
                    String.join " " <| List.map Problems.asString problems
            in
            Alert.config
                |> Alert.info
                |> Alert.dismissable AlertMsg
                |> Alert.children
                    [ Alert.h4 [] [ text "There is a problem:" ]
                    , p [] [ text problemString ]
                    , p [] [ text "Need help? ", Alert.link [ href <| "mailto:support@researchcatalogue.net?body=" ++ "Error message: " ++ problemString ] [ text "contact support" ] ]
                    , p [] [ Button.button [ Button.outlineSecondary, Button.attrs [ onClick DismissAllProblems ] ] [ text "Ok, close" ] ]
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
        "txt"


viewFullscreenSwitch : BuildType -> Bool -> Html Msg
viewFullscreenSwitch buildType currentMode =
    let
        message =
            ToggleFullscreen (not currentMode)

        btn =
            defaultButton message

        icn =
            if not currentMode then
                FullScreenIcon

            else
                NormalScreenIcon

        tit =
            if currentMode then
                "Exit Fullscreen"

            else
                "Enter Fullscreen"

        attrs =
            if currentMode then
                [ class "enabled", class "ml-1" ]

            else
                []
    in
    mkButton buildType { btn | icon = icn, title = tit, otherAttrs = attrs ++ [ class "fullscreen-button" ] }


viewLink : String -> String -> Html Msg
viewLink name url =
    a
        [ href url
        , class "btn btn-link ml-1"
        ]
        [ text name ]


separator : Html Msg
separator =
    span
        [ class "separator" ]
        [ text "|" ]


mkEditorToolbar : BuildType -> TabState -> List (Html Msg)
mkEditorToolbar buildType tabState =
    let
        mkButtonTarget =
            mkButton buildType

        cmEditor =
            case tabState of
                CmMarkdownTab ->
                    True

                TxtMarkdownTab ->
                    False

                StyleTab ->
                    True

                MediaListTab ->
                    False

        snippetMsg action =
            InsertAtCursor (snippet action)

        default : ButtonInfo Msg
        default =
            defaultButton (InsertAtCursor ( "", 0 ))

        -- note, this is a nonsense Msg, should always be overridden, is only here to satisfy msg requirement.
    in
    [ mkButtonTarget { default | onClickMsg = snippetMsg H1, text = "H1", title = "Header 1" }
    , mkButtonTarget { default | onClickMsg = snippetMsg H2, text = "H2", title = "Header 2" }
    , mkButtonTarget { default | onClickMsg = snippetMsg H3, text = "H3", title = "Header 3" }
    , separator
    , mkButtonTarget { default | onClickMsg = snippetMsg Bold, icon = BoldIcon, title = "Bold" }
    , mkButtonTarget { default | onClickMsg = snippetMsg Italic, icon = ItalicIcon, title = "Italic" }
    , separator
    , mkButtonTarget { default | onClickMsg = snippetMsg Bullet, icon = ListIcon, title = "Unordered list" }
    , mkButtonTarget { default | onClickMsg = snippetMsg Numbered, icon = NumberedIcon, title = "Numbered list" }
    , mkButtonTarget { default | onClickMsg = snippetMsg Link, icon = LinkIcon, title = "Hyperlink" }
    , mkButtonTarget { default | onClickMsg = snippetMsg Quote, icon = QuoteIcon, title = "Quote" }
    , mkButtonTarget { default | onClickMsg = InsertFootnoteAtCursor, text = "*", title = "Insert footnote" }
    , mkButtonTarget { default | onClickMsg = OpenMediaPicker, icon = MediaIcon, title = "Insert media object" }
    , separator
    ]
        ++ (if cmEditor then
                [ mkButtonTarget { default | onClickMsg = UndoCM, icon = UndoIcon, title = "Undo", hidden = not cmEditor }
                , mkButtonTarget { default | onClickMsg = RedoCM, icon = RedoIcon, title = "Redo", hidden = not cmEditor }
                , separator
                ]

            else
                []
           )


statusBar : Bool -> Model -> Html Msg
statusBar showStatus model =
    let
        wc =
            Exposition.wordCount model.exposition

        status =
            if showStatus then
                "Word count: " ++ String.fromInt wc

            else
                ""

        ( saveButtonText, attrs ) =
            case model.saved of
                UnsavedEmpty ->
                    ( "Empty, not saved", [ class "text-danger" ] )

                Saved ->
                    ( "Saved", [] )

                Unsaved ->
                    ( "Not Saved", [] )

        saveButton =
            Button.button
                [ Button.light
                , Button.attrs ([ class "save-button", onClick SaveTrigger ] ++ attrs)
                ]
                [ renderIcon model.buildTarget SaveIcon, text saveButtonText ]
    in
    div [ class "editor-status-bar" ]
        [ span [] [ text status ]
        , saveButton
        ]


view : Model -> Html Msg
view model =
    let
        -- todo : simplify arguments
        mediaDialogHtml =
            RCMediaEdit.view
                model.buildTarget
                makeMediaEditFun
                CloseMediaDialog
                InsertMediaAtCursor
                InsertMediaAsLinkAtCursor
                model.exposition
                model.mediaDialog

        confirmDialogHtml =
            UserConfirm.view model.confirmDialog

        uploadButtonHtml =
            viewUpload model.buildTarget uploadMediaButtonInfo model.mediaUploadStatus

        mediaList =
            Html.map
                MediaList
            <|
                RCMediaList.mediaListView model.buildTarget model.mediaList model.exposition.media (makeTableMessages uploadButtonHtml)

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
                , class "btn btn-link ml-1"
                ]
                [ renderIcon model.buildTarget EyeIcon
                ]

        -- some buttons should only show when editing the text
        showButtons =
            selectedEditorIsMarkdown model

        -- media upload not so useful in style
        showMediaUpload =
            selectedEditorIsMarkdown model

        editorToolbar =
            mkEditorToolbar model.buildTarget (getTabState model.editor)

        uploadMediaButtonInfo =
            let
                bttn =
                    defaultButton UploadMediaFileSelect
            in
            { bttn
                | icon = UploadCloud
                , offset = True
                , text = "Upload Media"
                , primary = True
                , otherAttrs = [ class "upload-button", class "soft-blue-background", Spacing.mb1, Spacing.mt1, Spacing.mr1 ]
                , title = "Add media files: images, video, audio or pdf"
            }

        importDocButtonInfo =
            let
                bttn =
                    defaultButton UploadImportFileSelect
            in
            { bttn
                | icon = ImportIcon
                , offset = True
                , text = "Import Doc"
                , primary = True
                , otherAttrs = [ Spacing.mb1, Spacing.mt1, Spacing.mr1 ]
                , title = "Import text from document (Word, Open office, Markdown, LaTeX etc.."
            }
    in
    div []
        [ viewNavbar model.buildTarget model

        --        , viewTabs model
        , mediaDialogHtml
        , confirmDialogHtml
        , Html.map MediaPicker <|
            RCMediaList.mediaPickerView model.buildTarget
                model.mediaPickerDialog
                model.exposition.media
                (makePickerConfig uploadButtonHtml)
        , div [ class "btn-toolbar", class "import-export-toolbar", attribute "role" "toolbar" ]
            [ optionalBlock showMediaUpload <| viewUpload model.buildTarget uploadMediaButtonInfo model.mediaUploadStatus
            , optionalBlock showButtons <| viewUpload model.buildTarget importDocButtonInfo model.importUploadStatus
            , optionalBlock showButtons <|
                mkDropdown model.exportDropState
                    ExportDropMsg
                    "Export Doc"
                    [ ( "doc", ConvertExposition RCAPI.Docx )
                    , ( "pdf", ConvertExposition RCAPI.Pdf )
                    , ( "epub", ConvertExposition RCAPI.Epub )
                    , ( "odt", ConvertExposition RCAPI.Odt )
                    , ( "latex", ConvertExposition RCAPI.Latex )
                    , ( "html", ConvertExposition RCAPI.Html )
                    , ( "markdown", ConvertExposition RCAPI.Md )
                    ]
                    "Export the current exposition"
            , span
                [ class "version-string"
                , title <| "Version: " ++ model.version
                ]
                [ text model.version ]
            ]
        , optionalBlock showButtons <|
            div
                [ class "toolbar"
                , class "markdown-toolbar"
                ]
            <|
                List.append
                    editorToolbar
                    [ editorCheckbox, viewFullscreenSwitch model.buildTarget model.fullscreenMode ]
        , alert
        , mediaList
        , statusBar (selectedEditorIsMarkdown model) model -- only show wordcount in markdown
        ]


importHasCorrectMime : File -> Result Problems.Problem File
importHasCorrectMime file =
    let
        mime =
            File.mime file

        supported =
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
    in
    if List.member mime supported then
        Ok file

    else
        Err <| Problems.UnsupportedImportType mime
