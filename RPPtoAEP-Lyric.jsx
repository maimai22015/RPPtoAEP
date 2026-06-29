// RPPtoAEP-Lyric.jsx
// name : RPPtoAEP-Lyric
// version : 1.0
// author : maimai
// website : ytpmv.info
// description : Imports REAPER RPP MIDI track lyrics and creates AE layers
//               switching compositions based on vowel of each lyric character.
// Licence : CC0
{
    var RPPpath = "";
    var RPPItem = [];     // [[position_sec, length_sec], ...] (media items, first MIDI item removed)
    var RPPLyric = [];    // ["あ", "い", ...] (one per MIDI note X event)
    var TotalDuration = 120;

    var FootageAndComp = [];
    var FootageAndCompObj = [];
    var FolderObj = [];

    // GUI control references (set in setting())
    var NewCompNameSetting;
    var WidthSetting;
    var HeightSetting;
    var FpsSetting;
    var VowelDropA;
    var VowelDropI;
    var VowelDropU;
    var VowelDropE;
    var VowelDropO;
    var VowelDropN;
    var FillGapsCheck;

    setting();

    // Maps a kana character to its vowel (a/i/u/e/o) or "n"
    function vowel(phoneme) {
        var syllabary = [
            ["a", "あかさたなはまやらわがざだばぱぁゃ"],
            ["i", "いきしちにひみ  り  ぎじぢびぴぃ"],
            ["u", "うくすつぬふむゆる  ぐずづぶぷぅゅ"],
            ["e", "えけせてねへめ  れ  げぜでべぺぇ"],
            ["o", "おこそとのほもよろをごぞどぼぽおっょ"]
        ];
        for (var k = 0; k < syllabary.length; k++) {
            if (syllabary[k][1].indexOf(phoneme) !== -1) {
                return syllabary[k][0];
            }
        }
        return "n";
    }

    function LoadRPP() {
        RPPItem = [];
        RPPLyric = [];
        if (RPPpath === "") return;

        RPPpath.encoding = "UTF-8";
        if (!RPPpath.open('r')) {
            alert("RPPファイルを開けませんでした。");
            return;
        }

        while (!RPPpath.eof) {
            var line = RPPpath.readln();

            // Parse ITEM blocks: read POSITION (line+1), skip SNAPOFFS (line+2), read LENGTH (line+3)
            if (line.indexOf("<ITEM") !== -1) {
                var posLine = RPPpath.readln();
                RPPpath.readln(); // SNAPOFFS
                var lenLine = RPPpath.readln();
                var posParts = posLine.split("POSITION ");
                var lenParts = lenLine.split("LENGTH ");
                if (posParts.length >= 2 && lenParts.length >= 2) {
                    RPPItem.push([Number(posParts[1]), Number(lenParts[1])]);
                }
            }

            // Parse X (lyric) events inside MIDI source blocks
            // Line format: "        <X delta 0 id -1 count lyric"
            if (line.toLowerCase().indexOf("<x ") !== -1) {
                var parts = line.split(" ");
                var lyric = parts[parts.length - 1];
                lyric = lyric.replace(/\s+$/, ""); // strip trailing whitespace
                if (lyric.length > 0) {
                    RPPLyric.push(lyric);
                }
            }
        }
        RPPpath.close();

        // First ITEM is the overall MIDI item -> use for total duration, then remove
        if (RPPItem.length > 0) {
            TotalDuration = RPPItem[0][0] + RPPItem[0][1];
            RPPItem.shift();
        }

        if (RPPItem.length !== RPPLyric.length) {
            alert("警告: メディアアイテム数(" + RPPItem.length +
                  ")と歌詞数(" + RPPLyric.length + ")が一致しません。\n" +
                  "少ない方の数まで処理します。");
        }
    }

    function getCompForVowel(v) {
        var dd;
        if      (v === "a") dd = VowelDropA;
        else if (v === "i") dd = VowelDropI;
        else if (v === "u") dd = VowelDropU;
        else if (v === "e") dd = VowelDropE;
        else if (v === "o") dd = VowelDropO;
        else                dd = VowelDropN;

        if (!dd || !dd.selection || dd.selection.index === 0) return null;
        var idx = dd.selection.index - 1; // offset -1 for "(none)" at index 0
        if (idx >= 0 && idx < FootageAndCompObj.length) {
            return FootageAndCompObj[idx];
        }
        return null;
    }

    function addGapLayer(comp, src, pos, len) {
        var layer = comp.layers.add(src);
        layer.startTime = pos;
        layer.inPoint   = pos;
        if (src.duration > 0 && src.duration < len && layer.canSetTimeRemapEnabled) {
            layer.timeRemapEnabled = true;
        }
        layer.outPoint = pos + len;
    }

    function run() {
        if (RPPItem.length === 0) {
            alert("アイテムが見つかりません。RPPファイルを確認してください。");
            return;
        }

        var compName = (NewCompNameSetting.text !== "") ? NewCompNameSetting.text : "NewComp(RPPtoAEP-Lyric)";
        var w   = (WidthSetting.text  === "" || isNaN(Number(WidthSetting.text)))  ? 1920 : Number(WidthSetting.text);
        var h   = (HeightSetting.text === "" || isNaN(Number(HeightSetting.text))) ? 1080 : Number(HeightSetting.text);
        var fps = (FpsSetting.text    === "" || isNaN(Number(FpsSetting.text)))    ? 60   : Number(FpsSetting.text);
        var dur = (TotalDuration > 0) ? TotalDuration : 120;

        // Get or create RPPtoAEP folder
        var parentFolder;
        if (FolderObj.length > 0) {
            parentFolder = FolderObj[0];
        } else {
            parentFolder = app.project.items.addFolder("RPPtoAEP");
        }

        var newComp = app.project.items.addComp(compName, w, h, 1, dur, fps);
        newComp.parentFolder = parentFolder;

        var count = Math.min(RPPItem.length, RPPLyric.length);
        var skipped = 0;

        for (var i = 0; i < count; i++) {
            var pos    = RPPItem[i][0];
            var len    = RPPItem[i][1];
            var lyric  = RPPLyric[i];
            var v      = vowel(lyric);
            var src    = getCompForVowel(v);

            if (src === null) {
                skipped++;
                continue;
            }

            var layer = newComp.layers.add(src);

            // Place layer at RPP item position; source plays from its beginning
            layer.startTime = pos;
            layer.inPoint   = pos;

            // Enable time remap if source is shorter than the note duration
            if (src.duration > 0 && src.duration < len && layer.canSetTimeRemapEnabled) {
                layer.timeRemapEnabled = true;
            }

            layer.outPoint = pos + len;
        }

        // Fill gaps between notes with n composition
        var gapCount = 0;
        if (FillGapsCheck.value && RPPItem.length > 0) {
            var nSrc = getCompForVowel("n");
            if (nSrc === null) {
                alert("隙間埋めが有効ですが、n のコンポジションが選択されていません。");
            } else {
                // Gap before the first item
                if (RPPItem[0][0] > 0.001) {
                    addGapLayer(newComp, nSrc, 0, RPPItem[0][0]);
                    gapCount++;
                }
                // Gaps between consecutive items
                for (var j = 0; j < RPPItem.length - 1; j++) {
                    var gapStart = RPPItem[j][0] + RPPItem[j][1];
                    var gapEnd   = RPPItem[j + 1][0];
                    if (gapEnd - gapStart > 0.001) {
                        addGapLayer(newComp, nSrc, gapStart, gapEnd - gapStart);
                        gapCount++;
                    }
                }
                // Gap after the last item
                var lastEnd = RPPItem[RPPItem.length - 1][0] + RPPItem[RPPItem.length - 1][1];
                if (TotalDuration - lastEnd > 0.001) {
                    addGapLayer(newComp, nSrc, lastEnd, TotalDuration - lastEnd);
                    gapCount++;
                }
            }
        }

        alert("完了: " + (count - skipped) + "個のレイヤーを生成しました。\n" +
              "(スキップ: " + skipped + "個 — コンプ未選択)\n" +
              (gapCount > 0 ? "隙間レイヤー: " + gapCount + "個" : ""));
    }

    function setting() {
        // Collect footage/comp items from the project
        for (var i = 0; i < app.project.items.length; i++) {
            var item = app.project.items[i + 1];
            if (item instanceof FootageItem || item instanceof CompItem) {
                FootageAndComp.push(item.name);
                FootageAndCompObj.push(item);
            } else if (item instanceof FolderItem && item.name === "RPPtoAEP") {
                FolderObj.push(item);
            }
        }

        var dlg = new Window('dialog', "RPPtoAEP-Lyric");
        var mainGrp = dlg.add("group");
        mainGrp.orientation = "column";
        mainGrp.alignChildren = "fill";

        mainGrp.add("statictext", undefined, "RPPtoAEP-Lyric");

        // RPP file selector
        var fileGrp = mainGrp.add("group");
        fileGrp.orientation = "row";
        fileGrp.add("statictext", undefined, ".RPP:");
        var pathLabel = fileGrp.add("statictext", undefined, "(未選択)");
        pathLabel.characters = 24;
        var browseBtn = fileGrp.add("button", undefined, "...");
        browseBtn.onClick = function() {
            var f = File.openDialog("RPPファイルを選択してください", "REAPER Project:*.rpp");
            if (f !== null) {
                RPPpath = f;
                pathLabel.text = f.name;
            }
        };

        // Composition settings panel
        var settingsPanel = mainGrp.add("panel", undefined, "Composition Settings");
        settingsPanel.orientation = "column";
        settingsPanel.alignChildren = "left";

        var nameGrp = settingsPanel.add("group");
        nameGrp.add("statictext", undefined, "Name:");
        NewCompNameSetting = nameGrp.add("edittext", undefined, "NewComp(RPPtoAEP-Lyric)");
        NewCompNameSetting.characters = 22;

        var sizeGrp = settingsPanel.add("group");
        sizeGrp.add("statictext", undefined, "W:");
        WidthSetting = sizeGrp.add("edittext", undefined, "1920");
        WidthSetting.characters = 5;
        sizeGrp.add("statictext", undefined, "H:");
        HeightSetting = sizeGrp.add("edittext", undefined, "1080");
        HeightSetting.characters = 5;
        sizeGrp.add("statictext", undefined, "FPS:");
        FpsSetting = sizeGrp.add("edittext", undefined, "60");
        FpsSetting.characters = 4;

        // Vowel -> composition mapping panel
        var vowelPanel = mainGrp.add("panel", undefined, "Vowel → Composition");
        vowelPanel.orientation = "column";
        vowelPanel.alignChildren = "fill";

        if (FootageAndComp.length === 0) {
            vowelPanel.add("statictext", undefined,
                "※プロジェクトにコンパジション/フッテージがありません");
        }

        var noneList = ["(none)"].concat(FootageAndComp);

        function addVowelRow(parent, label) {
            var g = parent.add("group");
            g.orientation = "row";
            var lbl = g.add("statictext", undefined, label);
            lbl.characters = 14;
            var dd = g.add("dropdownlist", undefined, noneList);
            dd.selection = 0;
            return dd;
        }

        VowelDropA = addVowelRow(vowelPanel, "a (あ行):");
        VowelDropI = addVowelRow(vowelPanel, "i (い行):");
        VowelDropU = addVowelRow(vowelPanel, "u (う行):");
        VowelDropE = addVowelRow(vowelPanel, "e (え行):");
        VowelDropO = addVowelRow(vowelPanel, "o (お行):");
        VowelDropN = addVowelRow(vowelPanel, "n (ん/other):");

        // Gap fill option
        var gapGrp = mainGrp.add("group");
        FillGapsCheck = gapGrp.add("checkbox", undefined,
            "ノート間の隙間に n コンポジションを生成");

        // Run button
        var runBtn = dlg.add("button", undefined, "RUN", { name: "ok" });
        runBtn.onClick = function() {
            dlg.close();
            LoadRPP();
            run();
        };

        dlg.show();
    }
}
