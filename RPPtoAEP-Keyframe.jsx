// rpp2aep-keyfrrame.jsx
// name : RPPtoAEP-Generate-Keyframe
// version : 0.1a
// author : maimai
// website : ytpmv.info
// discription : This is a script for After Effects that places items based on the REAPER project file.
// Licence : CC0
// 選択したレイヤーの選択したプロパティにRPPのタイミングでキーフレームを生成するスクリプト

(function() {
    var RPPpath = "";
    var RPPItem = []; // [[position, length], ...]

    // UIの作成
    var win = new Window("palette", "RPP キーフレーム生成ツール", undefined);
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 12;
    win.margins = 16;

    // ファイル選択エリア
    var fileGroup = win.add("group");
    fileGroup.orientation = "horizontal";
    fileGroup.add("statictext", undefined, "RPPファイル:");
    var pathText = fileGroup.add("statictext", undefined, "ファイルを選択してください...");
    pathText.characters = 25;
    var btnBrowse = fileGroup.add("button", undefined, "...");

    // 実行ボタン
    var btnRun = win.add("button", undefined, "選択プロパティにキーフレームを生成");

    // ブラウズボタンの処理
    btnBrowse.onClick = function() {
        var file = File.openDialog("REAPERプロジェクトファイルを選択してください", "*.rpp");
        if (file != null) {
            RPPpath = file;
            pathText.text = decodeURI(file.name);
        }
    };

    // RPPの解析処理（提示いただいたスクリプトのロジックを踏襲）
    function loadRPP() {
        RPPItem = [];
        if (RPPpath && RPPpath.exists) {
            var res = RPPpath.open('r');
            if (res) {
                while (!RPPpath.eof) {
                    var line = RPPpath.readln();
                    if (line.indexOf("<ITEM") != -1) {
                        var pLine = RPPpath.readln().split('POSITION ')[1]; // POSITION
                        RPPpath.readln(); // SNAPOFFS (スキップ)
                        var lLine = RPPpath.readln().split('LENGTH ')[1];   // LENGTH
                        if (pLine && lLine) {
                            RPPItem.push([Number(pLine), Number(lLine)]);
                        }
                    }
                }
                RPPpath.close();
            }
        }
    }

    // 実行ボタンの処理
    btnRun.onClick = function() {
        if (RPPpath == "" || !RPPpath.exists) {
            alert("有効なRPPファイルを選択してください。");
            return;
        }

        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("アクティブなコンポジションがありません。");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("対象のレイヤーをタイムライン上で選択してください。");
            return;
        }

        var selectedProps = comp.selectedProperties;
        if (selectedProps.length === 0) {
            alert("キーフレームを打ちたいプロパティ（位置、不透明度、エフェクトなど）を選択してください。");
            return;
        }

        // RPPファイルを解析して配列に格納
        loadRPP();

        if (RPPItem.length === 0) {
            alert("RPPファイルからアイテムが検出されませんでした。");
            return;
        }

        app.beginUndoGroup("RPPタイミングでキーフレーム生成");

        var keyCount = 0;

        // 選択されたプロパティに対してループ
        for (var p = 0; p < selectedProps.length; p++) {
            var prop = selectedProps[p];

            // キーフレームを追加できるプロパティ（canSetValue）かチェック
            // Property型（値を持つ最小単位のプロパティ）である必要があります
            if (prop.propertyType === PropertyType.PROPERTY) {
                
                for (var i = 0; i < RPPItem.length; i++) {
                    var itemStartPos = RPPItem[i][0]; // RPP上の位置（秒）
                    
                    // 元コードの仕様に合わせ、コンポ上の絶対時間（0秒基準）にキーフレームを打つ
                    // ※もしレイヤーのインポイントを基準にしたい場合は「+ prop.layer.inPoint」を足してください
                    var targetTime = itemStartPos; 

                    // コンポジションの時間範囲内かチェックしてキーを打つ
                    if (targetTime >= 0 && targetTime <= comp.duration) {
                        prop.addKey(targetTime);
                        keyCount++;
                    }
                }
            }
        }

        app.endUndoGroup();

        if (keyCount > 0) {
            alert("処理が完了しました。合計 " + keyCount + " 個のキーフレームを生成しました。");
            win.close();
        } else {
            alert("キーフレームを生成できませんでした。選択したプロパティが正しいか確認してください。");
        }
    };

    win.center();
    win.show();
})();