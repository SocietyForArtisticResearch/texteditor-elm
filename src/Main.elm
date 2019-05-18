port module Main exposing (Msg(..), main, update, view)

import Bootstrap.Button as Button
import Bootstrap.Form as Form
import Bootstrap.Modal as Modal
import Bootstrap.Utilities.Spacing as Spacing
import Browser
import Dict
import Exposition exposing (RCExposition, RCMediaObject, RCMediaObjectViewState, addMediaUserClasses, incContentVersion)
import File exposing (File)
import File.Select as Select
import Html exposing (Html, button, div, p, span, text)
import Html.Attributes exposing (attribute, for, id)
import Html.Events exposing (on, onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Problems
import RCAPI
import RCMediaEdit
import RCMediaList
import Regex
import String.Extra as Str
import UserConfirm exposing (ConfirmDialogContent)


type alias Model =
    { exposition : RCExposition
    , editGeneration : Int
    , mediaDialog : ( Modal.Visibility, Maybe ( RCMediaObject, Int ), Maybe RCMediaObjectViewState )
    , confirmDialog : ( Modal.Visibility, Maybe ConfirmDialogContent, Maybe (UserConfirm.Messages Msg) )
    , weave : Int
    , research : Int
    , mediaUploadStatus : UploadStatus
    , importUploadStatus : UploadStatus
    , problems : List Problems.Problem
    , mediaClassesDict : Dict.Dict Int String -- stores userclasses for media to be added to media list
    , saved : Bool
    , mediaCounter : Int
    }


type UploadStatus
    = Ready
    | Uploading Float


type alias Flags =
    { weave : Int, research : Int }


decodeFlags : D.Decoder Flags
decodeFlags =
    D.map2 Flags (D.field "weave" D.int) (D.field "research" D.int)


emptyModel : Int -> Int -> Model
emptyModel research weave =
    { editGeneration = -1
    , exposition = Exposition.empty
    , mediaDialog = ( Modal.hidden, Nothing, Nothing )
    , confirmDialog = ( Modal.hidden, Nothing, Nothing )
    , research = research
    , weave = weave
    , mediaUploadStatus = Ready
    , importUploadStatus = Ready
    , problems = []
    , mediaClassesDict = Dict.empty
    , saved = True
    , mediaCounter = 0
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
    { model | problems = problem :: model.problems }


addProblems : Model -> List Problems.Problem -> Model
addProblems model problems =
    { model | problems = problems ++ model.problems }


incMediaCounter : Model -> Model
incMediaCounter exp =
    { exp | mediaCounter = exp.mediaCounter + 1 }


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- PORTS
-- code mirror


port currentGeneration : (E.Value -> msg) -> Sub msg


port cmContent : (E.Value -> msg) -> Sub msg


port getContent : () -> Cmd msg


port setContent : String -> Cmd msg


port mediaDialog : (E.Value -> msg) -> Sub msg



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
    | InsertTool Exposition.RCMediaObject
    | CloseMediaDialog
    | GotExposition (Result Http.Error RCAPI.APIExposition)
    | GotMediaList (Result Http.Error (List RCAPI.APIMediaEntry))
    | UploadMediaFileSelect
    | UploadMediaFileSelected File
    | UploadImportFileSelect
    | UploadImportFileSelected File
    | GotMediaUploadProgress Http.Progress
    | GotImportUploadProgress Http.Progress
    | Uploaded (Result Http.Error ())
    | UploadedImport (Result Http.Error RCAPI.APIPandocImport)
    | SaveExposition
    | SavedExposition (Result Http.Error ())
    | SaveMediaEdit Exposition.RCMediaObject
    | SavedMediaEdit (Result Http.Error String)
    | ConfirmMediaDelete Exposition.RCMediaObject
    | CloseConfirmDialog



-- | MediaReplace Exposition.RCMediaObject
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
    , insertObject = InsertTool
    }



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotConvertedHtml html ->
            ( { model | exposition = Exposition.withHtml model.exposition html }
            , setPreviewContent html
            )

        EditGeneration val ->
            case D.decodeValue D.int val of
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
                ( D.decodeValue (D.field "generation" D.int) val
                , D.decodeValue (D.field "content" D.string) val
                )
            of
                ( Ok gen, Ok content ) ->
                    let
                        newHtml =
                            Exposition.insertToolHtml content model.exposition
                    in
                    ( { model
                        | editGeneration = gen
                        , exposition =
                            Exposition.withHtml
                                (Exposition.withMd model.exposition content)
                                newHtml
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
                            Debug.log "loaded html" newExposition.renderedHtml
                    in
                    ( { model
                        | exposition = newExposition
                        , mediaClassesDict = RCAPI.toMediaClassesDict e
                      }
                    , RCAPI.getMediaList model.research GotMediaList
                    )

                Err err ->
                    let
                        _ =
                            Debug.log "could not load exposition: " err
                    in
                    ( model, Cmd.none )

        SaveExposition ->
            ( model, RCAPI.saveExposition model.exposition SavedExposition )

        SavedExposition result ->
            case result of
                Ok _ ->
                    ( { model | saved = True }, Cmd.none )

                Err s ->
                    let
                        _ =
                            Debug.log "save error: " s
                    in
                    ( addProblem model Problems.CannotSave, Cmd.none )

        GotMediaList mediaResult ->
            case mediaResult of
                Err _ ->
                    ( addProblem model (Problems.CannotLoadMedia "http request failed")
                    , Cmd.none
                    )

                Ok media ->
                    let
                        ( problems, mediaEntries ) =
                            Problems.splitResultList
                                (List.map (RCAPI.toRCMediaObject model.research) media)

                        modelWithProblems =
                            addProblems model problems

                        expositionWithMedia =
                            List.foldr Exposition.addOrReplaceObject modelWithProblems.exposition mediaEntries

                        expositionWithClasses =
                            addMediaUserClasses expositionWithMedia model.mediaClassesDict

                        _ =
                            Debug.log "loaded exposition with media: " expositionWithClasses
                    in
                    ( { modelWithProblems
                        | exposition = expositionWithClasses
                      }
                    , Cmd.batch
                        [ setContent expositionWithClasses.markdownInput
                        , setPreviewContent expositionWithClasses.renderedHtml
                        ]
                    )

        MediaEdit ( objInModelName, objFromDialog ) ->
            -- TODO: store in backend
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
                            Debug.log "update media result: " s
                    in
                    ( model, Cmd.none )

                Err s ->
                    let
                        _ =
                            Debug.log "update media error: " s
                    in
                    ( addProblem model Problems.CannotUpdateMedia, Cmd.none )

        MediaDelete obj ->
            -- not implemented
            let
                _ =
                    Debug.log "All ok, no prob!" model
            in
            update CloseConfirmDialog model

        InsertTool obj ->
            -- not implemented
            ( model, Cmd.none )

        UploadMediaFileSelect ->
            ( model
            , Select.file [ "image/jpeg", "image/png" ] UploadMediaFileSelected
            )

        UploadMediaFileSelected file ->
            ( incMediaCounter model
            , RCAPI.uploadMedia model.research model.mediaCounter file (Http.expectWhatever Uploaded)
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
                    -- TODO: convert images to tools in markdown!
                    ( { model
                        | importUploadStatus = Ready
                        , exposition = Exposition.withMd model.exposition (model.exposition.markdownInput ++ importResult.markdown)
                      }
                    , RCAPI.getMediaList model.research GotMediaList
                    )

                Err e ->
                    -- TODO: add problem
                    let
                        _ =
                            Debug.log "error uploading: " e
                    in
                    ( model, Cmd.none )

        ConfirmMediaDelete object ->
            let
                content =
                    { prompt = object.name ++ " is about to be deleted. Are you sure?"
                    , confirm = "delete"
                    , reject = "keep"
                    }

                messages =
                    { confirm = MediaDelete object
                    , reject = CloseConfirmDialog
                    }
            in
            ( { model | confirmDialog = ( Modal.shown, Just content, Just messages ) }, Cmd.none )

        CloseConfirmDialog ->
            ( { model | confirmDialog = ( Modal.hidden, Nothing, Nothing ) }, Cmd.none )


viewUpload : Msg -> String -> UploadStatus -> Html Msg
viewUpload onClickMsg buttonText status =
    case status of
        Ready ->
            button [ onClick onClickMsg ] [ text buttonText ]

        Uploading fraction ->
            div [] [ text (String.fromInt (round (100 * fraction)) ++ "%") ]


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
            button [ onClick SaveExposition ] [ text saveButtonText ]
    in
    div []
        [ mediaDialogHtml
        , confirmDialogHtml
        , viewUpload UploadMediaFileSelect "Upload Media" model.mediaUploadStatus
        , viewUpload UploadImportFileSelect "Import Document" model.importUploadStatus
        , RCMediaList.view model.exposition.media makeTableMessages
        , saveButton
        ]
