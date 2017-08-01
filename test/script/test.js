QUnit.test('Config Test', function (assert) {
    assert.ok(WebAmdLoader.isArray([]));
});

QUnit.test('Load.load Test', function (assert) {
    var done = assert.async();
    var Loader = new WebAmdLoader.ScriptLoader();
    Loader.load('./script/load-test.js', function (event) {
        assert.ok(true, '加载处成功');
        console.log(Loader.getScriptTags());
        done();
    }, function (event) {
        assert.ok(false, '加载失败')
        done();
    });
});

QUnit.test('Define Function Test: null argumnet', function (assert) {
    assert.throws(WebAmdLoader.define, "Define function must have a argument.");
});

QUnit.test('Define Function Test: One argument', function (assert) {

    try {
        WebAmdLoader.define('Test Module Name');
    } catch (e) {
        assert.equal(e.message, 'Define function argument error!')
    }

    WebAmdLoader.define(function () {
        console.log('this is test code.');
    });
    assert.ok(true, "Araument is a function.");

    try {
        WebAmdLoader.define([]);
        assert.ok(true, "Araument is a Array object.");
    } catch (e) {
        assert.ok(false, e.message)
    }

});