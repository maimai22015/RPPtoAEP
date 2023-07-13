# RPPtoAEP

English ver -> [README_eng.md](README_eng.md)

皆さん御機嫌よう。まいまいです。

今回はREAPERのプロジェクトファイル上のメディアオブジェクトの位置をもとに、AfterEffects上にアイテムを配置するスクリプトを作成しました。

![image](https://user-images.githubusercontent.com/79758588/113301207-bab86e00-9339-11eb-84c6-0dbae5db5c2f.png)

こんな感じのREAPERのプロジェクトファイルを用意して、AfterEffectsでスクリプトを実行して読み込み、各種設定をすると

![image](https://user-images.githubusercontent.com/79758588/113301221-c146e580-9339-11eb-8c83-d3e66d01dee7.png)

こんな感じになります。

実際に動画として書き出してみるとこんな感じ。

https://imgur.com/kNGudIc

音MADやYTPMV制作において便利な機能を多数実装しています。

## 導入方法
Githubにて配布しています。

https://github.com/maimai22015/RPPtoAEP/releases/

RPPtoAEP.rarをダウンロードし、解凍して、.jsxファイルをAfterEffectsのScriptsフォルダにコピーしてください。

特に設定を弄っていなければ

`C:\Program Files\Adobe\[AE Installation Folder]\Support Files\Scripts`
にあるはずです。

コピーしたらAfterEffectsを起動し、メニュー->スクリプト->RPPtoAEP.jsxとLinkPropaties.jsxがあることを確認してください。

あれば導入成功です。

![image](https://user-images.githubusercontent.com/79758588/113301511-0cf98f00-933a-11eb-84d9-19971e9eb8c8.png)

## 使い方
動画作成中のプロジェクトを開いた状態で生成したいコンポジションをプロジェクトパネルで選択し、メニューからスクリプトを実行すると、

![image](https://user-images.githubusercontent.com/79758588/113301530-12ef7000-933a-11eb-971a-bf7eb9fdac19.png)

こんなウィンドウが立ち上がります。

各項目を設定し、RUNボタンを押すと実行され、アイテムがRPPtoAEPフォルダの中の新しいコンポジションに配置されます。

### 各項目の設定について
各項目について説明していきます。

* Generate Keyframe/Generate Composition
  * Generate Keyframeを選択した場合、選択したコンポジションの選択したアイテムの選択したプロパティとタイムスリップにキーフレームが追加されます。プロパティを選択する必要がある仕様は多分治す。
  * Generate Compositionを選択した場合、これ以降の説明項目を設定することで、新しいコンポジションに配置されます。

* .RPP
  * .RPPファイルを選択します。
* Select Item
  * AE上で配置するアイテムを選択します。
  * フッテージとコンポジションを選択できます。
  * 従って配置したいアイテムは予めAE上に読みこんで置く必要があります。
* Composition Name
  * 生成するコンポジションの名前を設定します。
  * 空欄でも構いません。
* Width,Haight,fps
  * 生成するコンポジションの設定をします。
* Start Position
  * 配置するフッテージ、コンポジションの開始時間を設定します。
* Flip left/right
  * 左右反転するかどうかを設定します。
* Link Properties
  * 配置するアイテムの位置、拡大率等のトランスフォームの値をリンクさせます。(後述)
* Odd Item Link Separately
  * 値のリンクを偶数番目アイテム、奇数番目アイテムごとに行います。
* Generate Mode
  * AE上でのアイテムの配置方法を選択します。
    * Without Gaps : アイテム間に隙間が無いように配置します。
    * Generate as per RPP : RPPファイル上でのアイテムの開始時間,終了時間通りに配置します。
    * Don't Ajust Item Length : アイテムを配置するときにフッテージやコンポジションの長さの設定を変えません。素材やコンポジションの長さのまま読み込まれます。

### Link Propertiesについて
Link PropertiesやOdd Item Link Separatelyを有効にしている場合、

生成された各コンポジションの一番最初のアイテム（レイヤー名：Control）のトランスフォームの値がそれ以降のすべてのアイテムに共有されます。

最初のアイテムにキーフレームを打って値を変化させた場合、以降のアイテムもすべて同じ動きをします。

![image](https://user-images.githubusercontent.com/79758588/113301572-1edb3200-933a-11eb-8d27-f81da9399e6d.png)

一番最初のアイテムだけにキーフレームを打つと、

https://imgur.com/D5FW4NT

同じ動きをします。

Odd Item Link Separatelyを有効にしている場合、ControlAレイヤーとControlBレイヤーが生成されるのでそれぞれ設定してください。

### 補助スクリプトLinkPropaties.jsxについて
上記のLink Propertiesでは、トランスフォームの値しかリンクしてくれないので、エフェクトのプロパティもリンクできるように補助スクリプトを用意しました。

対象のコンポジションを選択した状態でControlレイヤーに掛けたエフェクトの値をリンクさせたい項目を選択し、（下画像参考）スクリプトを実行すると他のアイテムにも設定がリンクされます。

Odd Item Link Separatelyを有効にし、Controlレイヤが2つある場合はControlAにエフェクトを掛けて、値を入れてください。

以上。役立ててください。ノシ

## 変更ログ

2023/7/13

* 素材コンポジションを選択した状態で実行すると自動選択
* aepのあるフォルダに"r2a.rpp"を配置すると自動読み込み
* 素材選択時に自動で生成先コンポ名を設定
* WithoutGAP指定時のバグ修正
* 多言語対応（日本語と英語）