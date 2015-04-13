// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;
var Introduction = require('./Introduction');
var Philosophy = require('./Philosophy');
var Basics = require('./Basics');
var Patterns = require('./Patterns');
var Showcase = require('./Showcase');
var Login = require('./patterns/Login');
var LigoLayout = require('ligo/components/Layout');
var LigoTBD = require('ligo/components/TBD');
var LigoDocument = require('ligo/components/Document');
var LigoFooter = require('ligo/components/Footer');
var LigoMenu = require('ligo/components/Menu');

var CONTENTS = [
  {route: "sg_introduction", label: 'Introduction', component: Introduction, default: true},
  {route: "sg_philosophy", label: 'Philosophy', component: Philosophy,
    contents: [
      {
        label: 'Best Practices',
        id: 'best-practices'
      },
      {
        label: 'Usability',
        id: 'usability'
      },
      {
        label: 'Interactions',
        id: 'interactions'
      },
      {
        label: 'Mobile',
        id: 'mobile'
      },
      {
        label: 'Accessibility',
        id: 'accessibility'
      }
    ]},
  {route: "sg_basics", label: 'Basics', component: Basics},
  {route: "sg_patterns", label: 'Patterns', component: Patterns,
    contents: [
      {route: "sg_login", label: 'Login', component: Login},
      {route: "sg_header", label: 'Header', component: LigoTBD},
      {route: "sg_dashboard", label: 'Dashboard', component: LigoTBD},
      {route: "sg_search", label: 'Search', component: LigoTBD}
    ]
  },
  {route: "sg_showcase", label: 'Showcase', component: Showcase,
    contents: [
      {route: "sg_oneview", label: 'OneView', component: LigoTBD}
    ]
  }
];

var StyleGuide = React.createClass({

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  _linkToNode: function(e) {
    e.preventDefault();
    var node = this.getDOMNode();
    node.parentNode.scrollTop = node.querySelectorAll('section#'+e.target.id)[0].offsetTop - 100;
  },

  render: function() {

    this._chapterIndex = -2;

    var chapterLinks = CONTENTS.map(function (chapter, index) {
      var chapterActive = this.context.router.isActive(chapter.route);
      var pageActive = (chapter.hasOwnProperty('contents') &&
        chapter.contents.some(function (page) {
          return page.route ? this.context.router.isActive(page.route) : false;
        }.bind(this)));
      var active = chapterActive || pageActive;

      var className = '';
      if (active) {
        className = 'active';
        this._chapterIndex = index;
      }

      return (
        <Link key={chapter.label} to={chapter.route} className={className}>
          {chapter.label}
        </Link>
      );
    }.bind(this));

    var chapter = CONTENTS[this._chapterIndex];
    var header = React.createFactory(chapter.component.Header)();
    var pageLinks = null;
    var nextLink = null;
    var onPage = false;
    var layoutCompact = false;

    if (chapter.hasOwnProperty('contents')) {

      var activePageIndex = -2;
      pageLinks = chapter.contents.map(function (page, index) {

        var className = '';
        if (page.route && this.context.router.isActive(page.route)) {
          className = 'active';
        }

        var pageLink = page.id ? <a key={page.id} id={page.id} href="#" onClick={this._linkToNode} className={className}>{page.label}</a> : (
          <Link key={page.label} to={page.route} className={className}>
            {page.label}
          </Link>
        );

        if (page.route && this.context.router.isActive(page.route)) {
          onPage = true;
          activePageIndex = index;
          layoutCompact = true;
          header = (
            <LigoMenu direction="right" accent={true}>
              {chapterLinks[this._chapterIndex]}
              {pageLink}
            </LigoMenu>
          );
        } else if (activePageIndex === (index - 1)) {
          nextLink = pageLink;
        }

        return pageLink;

      }.bind(this));
    }

    if (! nextLink) {
      nextLink = chapterLinks[this._chapterIndex + 1];
    }

    if (onPage) {
      // we are on a page, no chapters
      chapterLinks = null;
    }

    var accentIndex = this._chapterIndex + 1;

    var content;
    if (pageLinks || true) {
      content = (
        <LigoLayout centerColumn={true}>
          <LigoMenu direction="down" inline={true}>{pageLinks}</LigoMenu>
          <LigoDocument accentIndex={accentIndex}>
            <RouteHandler />
          </LigoDocument>
        </LigoLayout>
      );
    } else {
      content = (
        <LigoDocument centerColumn={true} accentIndex={accentIndex}>
          <RouteHandler />
        </LigoDocument>
      );
    }

    return (
      <div>
        <LigoLayout centerColumn={true} accentIndex={accentIndex}
          compact={layoutCompact}>
          <LigoMenu direction="down" accent={true} >
            {chapterLinks}
          </LigoMenu>
          {header}
        </LigoLayout>
        {content}
        <LigoFooter centerColumn={true} scrollTop={true}>
          <LigoMenu><span>Next: {nextLink}</span></LigoMenu>
        </LigoFooter>
      </div>
    );
  }
});

var Empty = React.createClass({
  render: function () {
    return (<div></div>);
  }
});

function createContentRoutes(contents, level) {
  var result = [];
  contents.forEach(function (content) {

    var handler;
    if (level > 1) {
      handler = content.component;
    } else {
      handler = content.component.Section;
    }
    if (! handler) {
      handler = Empty;
    }

    if (content.default) {
      result.push(
        <DefaultRoute key={content.label} name={content.route}
          handler={handler} />
      );
    } else {
      result.push(
        <Route key={content.label} name={content.route}
          path={content.label.toLowerCase()}
          handler={handler} />
      );
    }

    if (content.hasOwnProperty('contents')) {
      result = result.concat(createContentRoutes(content.contents, level + 1));
    }
  });
  return result;
}

StyleGuide.routes = function () {
  var routes = createContentRoutes(CONTENTS, 1);
  return (
    <Route name="style guide" path="styleguide" handler={StyleGuide}>
      {routes}
    </Route>
  );
};

module.exports = StyleGuide;
