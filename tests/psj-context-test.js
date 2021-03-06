var Context = require('../lib/psj-context'),
    _ = require('underscore'),
    resolver = require('../lib/psj-local-resolver'),
    Scope = require('../lib/psj-scope'),
    fs = require('fs'), Q = require('q'), path = require('path'), Tag = require('../lib/tag-function');

var core = '<%@taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>'

module.exports = {
    'eval ${value}': function (test) {

        var ctx = new Context(null, null, resolver, 'test#choose-when-otherwise');
        ctx.parse('<h1>hello ${myitems[0]} ${myitems[1]} ${myitems[2]}</h1>');
        //           ctx.parse(core+'<c:if test="${myitems}">hello</c:if>')
        function render(done) {
            ctx.render({myitems: 'abcd'.split('')}, function (err, out) {
                out = out.replace(/\s+/g, ' ').trim();
                test.equals(out, "<h1>hello a b c </h1>");
                done()
            });
        }

        render(function () {
            render(test.done.bind(test))
        });

    },
    'if-if': function (test) {
        try {
            var ctx = new Context(null, null, resolver, 'test#if-if');
            ctx.parse(core + '<c:if test="${myitems}">hello</c:if> <c:if test="${empty myitems}">sweet mercy</c:if> <c:if test="${myitems}">goodbye</c:if>')
//           ctx.parse(core+'<c:if test="${myitems}">hello</c:if>')
            ctx.render({requestScope: {myitems: 'abcd'.split('')}}, function (err, out) {
                out = out.replace(/\s+/g, ' ').trim();
                test.equals(out, "hello goodbye");
                test.done()
            });
        } catch (e) {
            test.ok(false, e.message);
            test.done();
        }

    },
    'test set tag request scope': function (test) {
        var ctx = new Context(null, null, resolver, 'test set tag request scope');
        ctx.parse(core + '<c:set var="myvar" scope="request" value="${myvalue}"/><c:set var="test2" value="${myvar}"/> this is some text');
        //    var scope = new Scope();
        ctx.render(new Scope({myvalue: 1}), function (err, out) {
//            test.equals(scope.scope.requestScope.myvar, 1);
//            test.equals(scope.scope.pageScope.test2, 1);
            test.equals(out, '\n\n this is some text');
            test.done();
        });
    },
    'test set tag': function (test) {
        var ctx = new Context(null, null, resolver);
        var scope = new Scope({myitems: 1})
        ctx.parse(core + '<c:set var="myvar" value="${myitems}"/> this is some text');
        ctx.render(scope, function (err, out) {
//            test.equals(scope.get('myvar', 'pageScope'), 1);
            test.equals(out, '\n this is some text');
            test.done();
        });
    },


    'test forEach tag with map': function (test) {
        var ctx = new Context(null, null, resolver);
        ctx.parse(core + '<c:forEach items="${myitems}" var="item" varStatus="loop">hello "${item.key}=${item.value}" - "${loop.first}" </c:forEach>  this is some text');
        ctx.render({myitems: {
            a: 1
        }}, function (err, out) {
            out = out.replace(/\s+/g, ' ').trim();
            test.equals(out, "hello \" a = 1 \" - \" true \" this is some text");
            test.done()
        })
    },
    'choose-when-otherwise': function (test) {
        try {
            var ctx = new Context(null, null, resolver, 'test#choose-when-otherwise');
            ctx.parse('<%@taglib prefix="core"  uri="http://java.sun.com/jsp/jstl/core" %>' +
                '<core:choose>' +
                '   <core:when test="${empty items == true}">hello </core:when>' +
                '   <core:when test="${empty myitems}">my name</core:when>' +
                '   <core:when test="${not empty items}">say </core:when>' +
                '   <core:otherwise>goodbye</core:otherwise>' +
                '</core:choose>');
            ctx.render({myitems: 'abcd'.split('')}, function (err, out) {
                out = out.replace(/\s+/g, ' ').trim();
                test.equals(out, "hello");
                test.done()
            });
        } catch (e) {
            test.ok(false, e.message);
            test.done();
        }

    },
    'test forEach tag': function (test) {
        var ctx = new Context(null, null, resolver, '#test forEach tag');
        ctx.parse(core + '<c:forEach items="${myitems}" var="item" varStatus="loop">hello "${item}" - "${loop.first}" - "${loop.current}"</c:forEach>  this is some text');
        ctx.render({myitems: 'abcd'.split('')}, function (err, out) {
            out = out.replace(/\s+/g, ' ').trim();
            test.equals(out, "hello \" a \" - \" true \" - \" a \" hello \" b \" - \" false \" - \" b \" hello \" c \" - \" false \" - \" c \" hello \" d \" - \" false \" - \" d \" this is some text");
            test.done()
        })
    }
}