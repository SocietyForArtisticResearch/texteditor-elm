module Main exposing (main)

import Bootstrap.CDN as CDN
import Bootstrap.Form
import Bootstrap.Grid as Grid
import Browser
import Html exposing (..)

main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }

type alias MediaFormModel =
    { rcMedia : RCMedia
    , status : FormStatus
    }

type alias FormField =
    { name : String
    , validator : Validator
    , status : ValidationStatus
    }

type ValidationStatus
    = Valid
    | Invalid String
    

type Validator a
    = a -> ValidationStatus
      
type FormStatus
    = Loading
    | Success
    | Fail
    | Changed
    | Saved


type alias RCMedia =
    { name : String
    , file : File
    , class : DisplayClass
    , copyright : String
    , description : String
    }


type InputType
    = Text
    | File
    | PullDown
    | TextArea


type Button
    = Remove
    | Insert


type Msg
    = UpdateField String String
    | Submit
    | Insert
    | Remove
    | ResetAll


type alias CssClass {
        { selector : String
        , name : String }

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

    
            


init : () -> Model, Cmd Msg )
init _ =
      
subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

viewClassesPicker : String -> List CssClass -> Html Msg
viewClassesPicker id classList =
    let selectItem : CssClass -> Html Msg
        selectItem item =
            Select.item [Select.value item.selector ] [ text item.name ]
    in
        Select.select [ Select.id id]
            <| List.map selectItem classList

view : Model -> Html Msg
view model =
    Form.form []
        [ Form.group []
            [ Form.label [ for "mediaName" ] [ text "Name" ]
            , Input.text [ Input.id "mediaName" ]
            , Form.help [] [ text "Use a unique name" ]
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
        , Button.button [ Button.primary ] [ text "Submit" ]
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    model



-- placeholder
