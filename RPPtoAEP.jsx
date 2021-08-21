// rpp2aep.jsx
// name : RPPtoAEP
// version : 0.2
// author : maimai
// website : ytpmv.info
// discription : This is a script for After Effects that places items based on the REAPER project file.
// Licence : CC0
{

    //変数 複数回実行を試したあと、必要なら初期化関数を用意。GUI生成後に
    var RPPpath = ""; // RPPファイルのパス 公開時は空文字列にすること
    var ExportTo = 0; // 0:現在のコンポジション 1:新しいコンポジション
    var IsMultipleTrack = 0; // RPP上で複数トラックがあるかどうか
    var RPPItem =[];//[[position,length],[position,length]]
    var RPPtextP ="";
    var RPPtextL ="";
    var WidthSetting = 1920;
    var HaightSetting = 1080;
    var NewConpNameSetting = "NewComp(RPP2AEP)";
    var FpsSetting = 60;
    var SelecdetItemiD = 0;
    var FootageAndCompObj =[];
    var FootageAndComp =[];
    //後でGUIのオブジェクトを入れるけどとりあえず宣言
    var ChkFlipSetting = 0; // 左右反転するかどうか
    var LinkPropSetting = 0; // 設定共有するかどうか
    var OddItemSetting = 0; // 設定共有する際に奇数アイテムを別にリンクするか
    var GenerateMode=0;
    var GenerateMode2=0; //レイヤーのプロパティ項目にキーフレームだけ生成するか
    var StartPosSetting = 0;
    var FolderObj = [];


    setting();

    function LoadRPP(){
        if(RPPpath !=""){
            var res= RPPpath.open('r'); //読み込み専用で開く
            if (res) {
                while(! RPPpath.eof)
                {
                    if(RPPpath.readln().indexOf("<ITEM")!=-1){
                        RPPtextP = RPPpath.readln().split('POSITION ')[1]; // POSITION
                        RPPpath.readln(); // SNAPOFFS ゴミ
                        RPPtextL = RPPpath.readln().split('LENGTH ')[1]; // LENGTH
                        RPPItem.push([Number(RPPtextP),Number(RPPtextL)])
                    }
                }
                RPPpath.close();
            }
        }
    }
    function run(){
        //不正な値の修正
        if(WidthSetting.text==""){WidthSetting.text=1920;}else if(isNaN(WidthSetting.text)==true){WidthSetting.text=1920;}
        if(HaightSetting.text==""){HaightSetting.text=1080;}else if(isNaN(HaightSetting.text)==true){HaightSetting.text=1080;}
        if(FpsSetting.text==""){FpsSetting.text=60;}else if(isNaN(FpsSetting.text)==true){FpsSetting.text=1080;}       
        if(NewConpNameSetting.text!=""){var NewComp = app.project.items.addComp(NewConpNameSetting.text, Number(WidthSetting.text), Number(HaightSetting.text), 1, 120, Number(FpsSetting.text));}
        else{var NewComp = app.project.items.addComp("NewComp(RPP2AEP)", Number(WidthSetting.text),  Number(HaightSetting.text), 1, 120, Number(FpsSetting.text));}
        if(FolderObj.length==0){var R2AParentFolder = app.project.items.addFolder("RPPtoAEP");}else{var R2AParentFolder = FolderObj[0];}
        
        NewComp.parentFolder =R2AParentFolder;
        var ItemDuration = FootageAndCompObj[SelecdetItemiD].duration; //アイテムの長さ。画像や平面オブジェクトだと0になる。
        var FirstItemFlag = 1; // 各トラック最初のアイテムに実行するためのフラグ
        var j=1;
        var ExpFlag=0;
        for(i=0;RPPItem.length>i;i++){

            // トラック最後かどうかの判定処理
            var LastItemFlag = 0;
            if (RPPItem[i+1]==undefined||RPPItem[i+1][0]<RPPItem[i][0]){LastItemFlag=1;} //最後のアイテムか次のアイテムが前にある場合 
            
            // トラック一番目のアイテムの場合新コンポ生成。だたしi=0を除く
            if (FirstItemFlag==1&&i!=0){
                j++;
                if(NewConpNameSetting.text!=""){var NewComp = app.project.items.addComp(NewConpNameSetting.text+" "+String(j), Number(WidthSetting.text), Number(HaightSetting.text), 1, 120, Number(FpsSetting.text));}
                else{var NewComp = app.project.items.addComp("NewComp(RPP2AEP) "+String(j), Number(WidthSetting.text),  Number(HaightSetting.text), 1, 120, Number(FpsSetting.text));}
                NewComp.parentFolder =R2AParentFolder;
                ExpFlag=0;
            }

            // アイテム生成
            if(GenerateMode.selection.index==0){//RPPの長さ通り
                var addedlayer = NewComp.layers.add(FootageAndCompObj[SelecdetItemiD]);
                addedlayer.inPoint=Number(StartPosSetting.text);
                addedlayer.startTime=RPPItem[i][0]-addedlayer.inPoint;
                //尺が足りないかの判定 足りないならタイムリマップ
                if(ItemDuration<RPPItem[i][1]&&addedlayer.canSetTimeRemapEnabled){addedlayer.timeRemapEnabled=true;}
                addedlayer.outPoint =Number(RPPItem[i][1])+addedlayer.startTime;
            }else if (GenerateMode.selection.index==1){
                // 長さの調整（隙間なく生成する）
                var addedlayer = NewComp.layers.add(FootageAndCompObj[SelecdetItemiD]);
                addedlayer.inPoint=Number(StartPosSetting.text);
                addedlayer.startTime=RPPItem[i][0]-addedlayer.inPoint;
                //尺が足りないかの判定 足りないならタイムリマップ有効。
                if(ItemDuration<RPPItem[i][1]&&addedlayer.canSetTimeRemapEnabled){addedlayer.timeRemapEnabled=true;}
                if(FirstItemFlag==1&&addedlayer.startTime!=0&&LastItemFlag!=1){ // トラック最初のアイテムが0秒開始じゃなかった場合割り込み処理
                    //トラックにアイテムが1個の場合無限ループに入るためLastItemFlag!=1で除外
                    addedlayer.startTime=0;
                    addedlayer.outPoint =Number(RPPItem[i][0]);
                    var AddedEffFlip = addedlayer.property("ADBE Effect Parade").addProperty("ADBE Geometry2");
                    AddedEffFlip.property("ADBE Geometry2-0011").setValue(0);
                    AddedEffFlip.property("ADBE Geometry2-0004").setValue(-100);
                    i--;
                }else if(LastItemFlag==1){
                    addedlayer.outPoint =Number(RPPItem[i][1])+addedlayer.startTime;
                }else{
                    addedlayer.outPoint =Number(RPPItem[i+1][0]);//次のアイテムの頭まで伸ばす
                }
            }else if(GenerateMode.selection.index==2){//アイテムの長さを調整しない(素材=Footage/Compositeのママ)
                var addedlayer = NewComp.layers.add(FootageAndCompObj[SelecdetItemiD]);
                addedlayer.inPoint=Number(StartPosSetting.text); // レイヤーの再生開始位置 空白になっていてもNumber関数は0を返す
                addedlayer.startTime=RPPItem[i][0]-addedlayer.inPoint; // 再生開始位置

            }
            //左右反転
            if(ChkFlipSetting.value==1&&i%2==1){
                //addedlayer.property("scale").setValue([-100,100]);
                var AddedEffFlip = addedlayer.property("ADBE Effect Parade").addProperty("ADBE Geometry2");
                AddedEffFlip.property("ADBE Geometry2-0011").setValue(0);
                AddedEffFlip.property("ADBE Geometry2-0004").setValue(-100);
            }

            //効果のリンク
            
            if(LinkPropSetting.value==1&&FirstItemFlag==1&&OddItemSetting.value==0){
                addedlayer.name="Control";}
            if(LinkPropSetting.value==1&&FirstItemFlag==0&&OddItemSetting.value==0){
                //addedlayer.property("scale").expression='thisComp.layer("Control").transform.position.valueAtTime(time-inPoint)'
                if(addedlayer.property("anchorPoint").canSetExpression){
                    addedlayer.property("anchorPoint").expression='thisComp.layer("Control").transform.anchorPoint.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("position").canSetExpression){
                    addedlayer.property("position").expression='thisComp.layer("Control").transform.position.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("scale").canSetExpression){
                    addedlayer.property("scale").expression='thisComp.layer("Control").transform.scale.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("rotation").canSetExpression){
                    addedlayer.property("rotation").expression='thisComp.layer("Control").transform.rotation.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("opacity").canSetExpression){
                    addedlayer.property("opacity").expression='thisComp.layer("Control").transform.opacity.valueAtTime(time-inPoint)'
                }
            }
            if(FirstItemFlag==1&&OddItemSetting.value==1){
                addedlayer.name="ControlA";
                var OddLinkFlag = 1; //ControlA直後のアイテムのフラグ。
            }
            if(ExpFlag%2==0&&FirstItemFlag==0&&OddLinkFlag==0&&OddItemSetting.value==1){
                if(addedlayer.property("anchorPoint").canSetExpression){
                    addedlayer.property("anchorPoint").expression='thisComp.layer("ControlA").transform.anchorPoint.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("position").canSetExpression){
                    addedlayer.property("position").expression='thisComp.layer("ControlA").transform.position.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("scale").canSetExpression){
                    addedlayer.property("scale").expression='thisComp.layer("ControlA").transform.scale.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("rotation").canSetExpression){
                    addedlayer.property("rotation").expression='thisComp.layer("ControlA").transform.rotation.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("opacity").canSetExpression){
                    addedlayer.property("opacity").expression='thisComp.layer("ControlA").transform.opacity.valueAtTime(time-inPoint)'
                }
                addedlayer.name="1";
            }
            if(ExpFlag%2==1&&FirstItemFlag==0&&OddLinkFlag==0&&OddItemSetting.value==1){
                //addedlayer.property("scale").expression='thisComp.layer("Control").transform.position.valueAtTime(time-inPoint)'
                if(addedlayer.property("anchorPoint").canSetExpression){
                    addedlayer.property("anchorPoint").expression='thisComp.layer("ControlB").transform.anchorPoint.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("position").canSetExpression){
                    addedlayer.property("position").expression='thisComp.layer("ControlB").transform.position.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("scale").canSetExpression){
                    addedlayer.property("scale").expression='thisComp.layer("ControlB").transform.scale.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("rotation").canSetExpression){
                    addedlayer.property("rotation").expression='thisComp.layer("ControlB").transform.rotation.valueAtTime(time-inPoint)'
                }
                if(addedlayer.property("opacity").canSetExpression){
                    addedlayer.property("opacity").expression='thisComp.layer("ControlB").transform.opacity.valueAtTime(time-inPoint)'
                }
                addedlayer.name="2";
            }
            if(OddLinkFlag==1&&addedlayer.name!="ControlA"){
                addedlayer.name="ControlB";
                var OddLinkFlag = 0;
            }

            //フラグ管理
            if(FirstItemFlag==1){FirstItemFlag=0;}
            if(LastItemFlag==1){FirstItemFlag=1;}
            ExpFlag++;

        }

    
    }
    // レイヤー上にキーフレーム生成
    function run2(){
        var selectComp = app.project.selection;
        if(selectComp.length == 1&&selectComp[0] instanceof CompItem){
            if(selectComp[0].selectedProperties.length==0){alert("Select a Layer and Propaties");return;}
            if(selectComp[0].selectedLayers[0].canSetTimeRemapEnabled){
                selectComp[0].selectedLayers[0].timeRemapEnabled=true;
                selectComp[0].selectedLayers[0].property("Time Remap").expression='//When you want to set value,please disable expression temporarily. \
                n = 0; \
                if (thisProperty.numKeys > 0){n = thisProperty.nearestKey(time).index; \
                    if (thisProperty.key(n).time > time) n--;} \
                n > 0 ?valueAtTime(time - thisProperty.key(n).time) : valueAtTime(0); \
                ';//参考：https://www.youtube.com/watch?v=w5zKZov4-u0
            }


            for(var k=0;k<selectComp[0].selectedProperties.length;k++){

                if(selectComp[0].selectedLayers[0].selectedProperties[k].canSetExpression){
                    selectComp[0].selectedLayers[0].selectedProperties[k].expression='//When you want to set value,please disable expression temporarily. \
                    n = 0; \
                    if (thisProperty.numKeys > 0){n = thisProperty.nearestKey(time).index; \
                        if (thisProperty.key(n).time > time) n--;} \
                    n > 0 ?valueAtTime(time - thisProperty.key(n).time) : valueAtTime(0); \
                    ';
                }
                //selectComp[0].selectedProperties[k];
                for(i=0;RPPItem.length>i;i++){
                    selectComp[0].selectedProperties[k].addKey(selectComp[0].selectedLayers[0].inPoint+RPPItem[i][0]);
                    if(selectComp[0].selectedLayers[0].canSetTimeRemapEnabled){
                        selectComp[0].selectedLayers[0].property("Time Remap").addKey(selectComp[0].selectedLayers[0].inPoint+RPPItem[i][0]);
                    }
                    if (RPPItem[i+1]==undefined||RPPItem[i+1][0]<RPPItem[i][0]){//最後のアイテムか次のアイテムが前にある場合 
                        selectComp[0].selectedLayers[0].outPoint=RPPItem[i][0]+RPPItem[i][1]+selectComp[0].selectedLayers[0].inPoint;
                        return;
                    }
                    
                }
                


            }

        }else{alert("Select a Compotision and Propaties")}
    }
    function setting(){
        //GetFootageItem

        for(var i =0;app.project.items.length>i;i++){
            if(app.project.items[i+1] instanceof FootageItem ||app.project.items[i+1] instanceof CompItem){
                FootageAndComp.push(app.project.items[i+1].name);
                FootageAndCompObj.push(app.project.items[i+1]);
            }else if(app.project.items[i+1] instanceof FolderItem && app.project.items[i+1].name=="RPPtoAEP"){
                FolderObj.push(app.project.items[i+1]);
            }
        }
        // SET UI
        var w = new Window('dialog',"RPPtoAEP");
        var GUIItemGroup = w.add("group"); //全体の大枠 左揃え
        GUIItemGroup.orientation = "column";
        GUIItemGroup.add("statictext",undefined,"RPPtoAEP Setting");
        var GUIItemGroupFileLoad = GUIItemGroup.add("group");
        GUIItemGroupFileLoad.add("statictext",undefined,".RPP");
        var RPPpathset = GUIItemGroupFileLoad.add("statictext",undefined,"");
        RPPpathset.characters = 20;
        var RPPload = GUIItemGroupFileLoad.add('button',undefined, '...');
        RPPload.onClick= function () {
            RPPpath = File.openDialog("Select .RPP file", "*.rpp")
            if (RPPpath == null){alert("error");return -1;}
            RPPpathset.text= RPPpath;
        }
        var GUIItemGroupLR = GUIItemGroup.add("panel");
        GUIItemGroupLR.alignment = [ScriptUI.Alignment.LEFT,ScriptUI.Alignment.CENTER];
        GUIItemGroupLR.orientation="column";
        GUIItemGroupLR.alignment ="fill";
        GUIItemGroupLR.alignChildren="LEFT";
        
        var GUIItemGroup1_2 =  GUIItemGroupLR.add("group");
        GUIItemGroup1_2.orientation="row";
        GenerateMode2=GUIItemGroup1_2.add('dropdownlist', undefined, ["Generate New Composition","Generate Keyframe"]);
        GenerateMode2.selection=0;

        var GUIItemGroup1 =  GUIItemGroupLR.add("group")
        GUIItemGroup1.orientation="row";
        GUIItemGroup1.add("statictext",undefined,"Select Item");
        w.menu= GUIItemGroup1.add('dropdownlist', undefined, FootageAndComp);

        var GUIItemGroup2 =  GUIItemGroupLR.add("group")
        GUIItemGroup2.orientation="row";
        GUIItemGroup2.add("statictext",undefined,"Composition Name");
        NewConpNameSetting = GUIItemGroup2.add("edittext",undefined,"")
        NewConpNameSetting.characters = 10;

        var GUIItemGroup7 =  GUIItemGroupLR.add("group")
        GUIItemGroup7.orientation="row";
        GUIItemGroup7.add("statictext",undefined,"width : ");
        WidthSetting = GUIItemGroup7.add("edittext",undefined,"1920");
        WidthSetting.characters = 4;
        GUIItemGroup7.add("statictext",undefined,"haight : ");
        HaightSetting = GUIItemGroup7.add("edittext",undefined,"1080");
        HaightSetting.characters = 4;
        GUIItemGroup7.add("statictext",undefined,"fps : ");
        FpsSetting = GUIItemGroup7.add("edittext",undefined,"60");
        FpsSetting.characters = 4;

        var GUIItemGroup3 =  GUIItemGroupLR.add("group")
        GUIItemGroup3.orientation="row";
        GUIItemGroup3.add("statictext",undefined,"Start Position");
        StartPosSetting = GUIItemGroup3.add("edittext",undefined,"");
        StartPosSetting.characters = 3;
        StartPosSetting.text="0"
        
        var GUIItemGroup4 =  GUIItemGroupLR.add("group")
        GUIItemGroup4.orientation="row";
        //GUIItemGroup4.add("statictext",undefined,"Flip left/right");
        ChkFlipSetting = GUIItemGroup4.add("checkbox",undefined,"Flip left/right");

        var GUIItemGroup5 =  GUIItemGroupLR.add("group")
        GUIItemGroup5.orientation="row";
        //GUIItemGroup4.add("statictext",undefined,"Flip left/right");
        LinkPropSetting = GUIItemGroup5.add("checkbox",undefined,"Link Properties");
        OddItemSetting = GUIItemGroup5.add("checkbox",undefined,"Odd Item Link Separately");
        
        var GUIItemGroup6 =  GUIItemGroupLR.add("group")
        GUIItemGroup6.orientation="row";
        GUIItemGroup6.add("statictext",undefined,"Generate Mode: ");
        GenerateMode=GUIItemGroup6.add('dropdownlist', undefined, ["Generate as per RPP","Without Gaps","Don't Ajust Item Length"]);
        GenerateMode.selection=1;


        w.btn = w.add('button', {x:0, y:0, width:130, height:26}, 'RUN', {name:'ok'});
        w.btn.onClick= function () {
            w.close();
            SelecdetItemiD = w.menu.selection.index;
            LoadRPP();
            // RPPファイルの読み込みRPPItem配列に時間を打ち込む
            if(GenerateMode2.selection==0){run();}
            else if(GenerateMode2.selection==1){run2();}
            
        }
        GenerateMode2.onChange = function(){
            if(GUIItemGroup2.visible==true){
                GUIItemGroup1.hide();
                GUIItemGroup2.hide();
                GUIItemGroup3.hide();
                GUIItemGroup4.hide();
                GUIItemGroup5.hide();
                GUIItemGroup6.hide();
                GUIItemGroup7.hide();
            }else{
                GUIItemGroup1.show();
                GUIItemGroup2.show();
                GUIItemGroup3.show();
                GUIItemGroup4.show();
                GUIItemGroup5.show();
                GUIItemGroup6.show();
                GUIItemGroup7.show();
            }
        }
        
        w.menu.selection= 0;
        w.show();
    }
}
