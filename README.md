# GestureManager

## 概要

このソフトウェアは、スマートフォンでのマルチタッチジェスチャーを検出する簡易のJavaScriptライブラリです。

iOS/Android(Ver.4以降)に対応しており、各OSでの動作の違いを意識することなくジェスチャーを扱えます。

ジェスチャー操作を扱うWebアプリケーションを開発する際に利用できます。

検出できるジェスチャーは以下のとおりです。

- ダブルタップ(*1)
- 二本指による拡大／回転動作の検出(gesturechangeイベント)(*2)

(*1) ダブルタップは一般にはジェスチャーとは呼ばないかもしれませんが、Webアプリケーションを開発する際、検出したいケースが多くあるので本ライブラリに組み込んであります。

(*2) iOSではネイティブのgesturechangeイベントで拡大率(scale)と回転角(rotation)を取得できますが、Androidではgesturechangeイベントがないため、これをエミュレートしてiOS同様、scale、rotationを取得できるようにしています。

## サンプルページ

sample/ディレクトリ配下のファイルをWebサーバーにアップロードしてiOS/Android端末からアクセスすると、動作サンプルを確認できます。以下のURLにも同じものをアップロード済みです。

https://www.bit-hive.com/~tomita/github/gesturemanager/

※iOS/Android端末でアクセスしてください。

ページ上で二本指でピンチ操作をすると、それに合わせて、中央のテキストが拡大／回転します。

ダブルタップを検出すると、ページ下のログエリアにログが表示されます。


## 使い方

### 読み込み方法

配布用のファイルはdist/配下にあります。

    gesture-manager.js (UMD形式)
    gesture-manager.min.js (gesture-manager.jsをminifyしたもの)

現在は&lt;script&gt;タグで読み込むためのUMD形式のみです。このファイルをWebサーバー上にアップロードし、htmlファイルから&lt;script&gt;タグで読み込んでください。


    <script type="text/javascript" src="js/gesture-manager.js"></script>


### イベントの検出

まず、GestureManagerオブジェクトを作成します。以下のようにイベントを取りたいDOMのCSSセレクタを指定するか、DOM要素のオブジェクトを指定してください。

    var manager = GestureManager.createGestureManager('#screen');

あとはイベントハンドラを登録するだけです。DOMのaddEventListenerと同じように、addEventListener(eventname, callback)と指定してください。

    manager.addEventListener('doubletap', function (e) {
      log('doubletap: clientX ' + e.clientX + ', clientY ' + e.clientY);
    });

    manager.addEventListener('gesturestart', function (e) {log('gesturestart');});

    manager.addEventListener('gesturechange', function (e) {
      log('gesturechange: scale ' + round(e.scale) + ', rotation ' + round(e.rotation) + ' degree, center.x ' + round(e.center.x) + ', .y ' + round(e.center.y));
    });

    manager.addEventListener('gestureend', function (e) {log('gestureend');});

removeEventListener(eventname, callback)でイベントハンドラを削除することもできます。

サンプルコードを参照するなら、sample/index.html, sample/js/sample.js あたりを参照してください。

### イベントの種類

GestureManagerが生成するイベントは以下のものがあります。

(1) doubletap

ダブルタップ時に発生します。

イベントハンドラに渡されるイベントオブジェクトのプロパティは以下のとおりです。

|property|value|
|-|-|
|name|'doubletap'|
|clientX|タップしたX座標|
|clientY|タップしたY座標|

(2) gesturestart

複数指によるジェスチャー操作開始時に発生します。

イベントハンドラに渡されるイベントオブジェクトのプロパティは以下のとおりです。

|property|value|
|-|-|
|name|'gesturestart'|

(3) gesturechange

複数指によるジェスチャー操作中に発生します。拡大率、回転角は本イベントで取得できます。3本指以上の操作は考慮していません。

イベントハンドラに渡されるイベントオブジェクトのプロパティは以下のとおりです。

|property|value|
|-|-|
|name|'gesturechange'|
|scale|拡大率(初期値は1.0)|
|rotation|回転角(度)|
|center.x|二本指間の中心座標|
|center.y|二本指間の中心座標|

※center.x,.yはgesturestart時に決定し、gesturechange中に変更になることはありません。


(4) gestureend

ジェスチャー操作終了時に発生します。

イベントハンドラに渡されるイベントオブジェクトのプロパティは以下のとおりです。

|property|value|
|-|-|
|name|'gestureend'|

## TODO

スワイプ動作の検出


