{
    var selectComp = app.project.selection;
    if(selectComp.length == 1&&selectComp[0] instanceof CompItem){
        var EffectName = [];
        var EffPropaties =[];
        var l=0;
        var MyMode=0;
        for(var k=0;k<selectComp[0].selectedProperties.length;k++){
            
            if (selectComp[0].selectedProperties[k] instanceof PropertyGroup){
                if(selectComp[0].selectedProperties[k].isEffect){
                    EffectName.push(selectComp[0].selectedProperties[k].name);
                    EffPropaties.push([]);
                    l++;
                }else{alert("You can link only Effects parameter.")}
            }else if(selectComp[0].selectedProperties[k] instanceof Property){
                EffPropaties[l-1].push(selectComp[0].selectedProperties[k].name);
            }
        }
        for(var k=1;k<selectComp[0].layers.length+1;k++){
            if(selectComp[0].layers[k].name=="Control"){MyMode=1;}
            if(selectComp[0].layers[k].name=="ControlA"){MyMode=2;}
        }
        for(var k=1;k<selectComp[0].layers.length+1;k++){
            if(selectComp[0].layers[k].name!="Control"&&MyMode==1){
                for(var m=0;EffectName.length>m;m++){
                    var AddedEffect = selectComp[0].layers[k].property("ADBE Effect Parade").addProperty(EffectName[m]);
                    for(var n=0;EffPropaties[m].length>n;n++){
                        $.write(EffPropaties[m].length)
                        if(AddedEffect.property(String(EffPropaties[m][n])).canSetExpression){
                            AddedEffect.property(String(EffPropaties[m][n])).expression='thisComp.layer("Control").effect("'+EffectName[m]+'")("'+String(EffPropaties[m][n])+'").valueAtTime(time-inPoint)'
                        }
                    }
                }
            }
            if(selectComp[0].layers[k].name!="ControlA"&&selectComp[0].layers[k].name!="ControlB"&&MyMode==2){
                for(var m=0;EffectName.length>m;m++){
                    var AddedEffect = selectComp[0].layers[k].property("ADBE Effect Parade").addProperty(EffectName[m]);
                    for(var n=0;EffPropaties[m].length>n;n++){
                        $.write(EffPropaties[m].length)
                        if(AddedEffect.property(String(EffPropaties[m][n])).canSetExpression){
                            if(selectComp[0].layers[k].name=="1"){
                                AddedEffect.property(String(EffPropaties[m][n])).expression='thisComp.layer("ControlA").effect("'+EffectName[m]+'")("'+String(EffPropaties[m][n])+'").valueAtTime(time-inPoint)'
                            }
                            if(selectComp[0].layers[k].name=="2"){
                                AddedEffect.property(String(EffPropaties[m][n])).expression='thisComp.layer("ControlB").effect("'+EffectName[m]+'")("'+String(EffPropaties[m][n])+'").valueAtTime(time-inPoint)'
                            }
                        }
                    }
                }
            }else if(selectComp[0].layers[k].name=="ControlB"&&MyMode==2){
                for(var m=0;EffectName.length>m;m++){
                    selectComp[0].layers[k].property("ADBE Effect Parade").addProperty(EffectName[m]);
                }
            }
        }
    }else{alert("Select a Compotision and effects Propaties")}
}