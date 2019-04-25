module RCMediaEdit exposing (view)

import Bootstrap.CDN as CDN
import Bootstrap.Form
import Bootstrap.Form.Input as Input
import Bootstrap.Form.Select as Select
import Bootstrap.Form.Textarea as Textarea
import Bootstrap.Grid as Grid
import Browser
import Exposition exposing (RCExposition, RCMediaObject)
import Html exposing (..)
import Html.Attributes exposing (..)
import Validate exposing (Validator, fromErrors, ifBlank, ifNotInt, validate)

main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        } 
        
type Field
    = Name
    | Description
    | StylingClass
    | Copyright
    | File


type alias MediaEditMessages msg =
    { insertTool : msg
    , editTool : (RCMediaObject -> msg)
    , deleteTool : (RCMediaObject -> msg)
    }
      
type File
    = String


type alias CssClass =
    { selector : String
    , name : String
    }

type alias RCMediaObjectValidation =
    { name : Result String String
    , description :Result String String
    , copyright : Result String String
    , file : Result String String
    , cssClass : Result String String }
        

cssClasses : List CssClass
cssClasses =
    [ CssClass "big" "big"
    , CssClass "medium" "medium"
    , CssClass "small" "small"
    , CssClass "floatLeftSmall" "small & float left"
    , CssClass "floatRightSmall" "small & float right"
    , CssClass "floatRightMedium" "medium & float right"
    , CssClass "floatLeftMedium" "medium & float left"
    ]


viewClassesPicker : String -> List CssClass -> CssClass -> Html Msg
viewClassesPicker id classList currentSelection =
    let
        selectItem : CssClass -> Html Msg
        selectItem item =
            let isSelected = (currentSelection.selector == selectItem) in
            Select.item [ Select.value item.selector
                        , Html.Attributes.Selected isSelected ]
                [ text item.name ]
    in
    Select.select [ Select.id id ] <|
        List.map selectItem classList


viewInput : String -> String -> (String -> msg) -> Html msg
viewInput placeholderArg valueArg toMsg =
    Input.text [ placeholder placeHolderArg, value valueArg, onInput toMsg ] []


            

createStringValidator : Result -> String -> String =
createStringValidator value original =
    case value of
        OK val -> val

        ERR val -> original
                             

validateRCMedia : RCMediaObject -> 

-- view : ValidationStatus -> MediaEditMesages -> Html msg
view : String -> String -> CssClass -> Html msg
view  = objectName copy cssClass 
    let
        remove =
            remove mediaID exposition

            edit mediaID exposition
    in
    div []
        [ p [ text "media object" ++ String.fromInt MediaObjectID ] []
        , Form.form []
            [ Form.group []
                [ Form.label [ for "mediaName" ] [ text "Name" ]
                , viewInput "media name" objectName
                , Form.help [] [ text "Use a unique name" ]
                ]
            , From.group []
                [ Form.label [ for "copyright" ] [ text "copyright" ]
                , viewInput "copyright" copyright
                , From.help [] [ text "Obligatory!" ]
                ]
            , Form.group []
                [ Form.label [ for "classPicker" ] [ text "How should the media be displayed" ]
                , viewClassesPicker "classPicker" cssClasses
                ]
            , Form.group []
                [ label [ for "mediaDescription" ] [ text "description" ]
                , Textarea.textarea
                    [ Textarea.id "mediaDescription"
                    , Textarea.rows 3
                    ]
                ]
            , Button.button [ Button.primary, onClick remove ] [ text "Insert" ]
            , Button.button [ Button.primary, onClick edit ] [ text "Remove" ]
            ]
        ]


update : Msg -> MediaForm -> ( MediaForm, Cmd Msg )
update msg model =
    model



-- placeholder
