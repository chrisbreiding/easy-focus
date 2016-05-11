describe('Easy Focus', function () {
  function addScript (doc, src) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = false;
    doc.body.appendChild(script);
  }

  function getInShadowDom (selector) {
    return cy.get('.__easy-focus__container').then(function ($container) {
      return Cypress.$($container[0].shadowRoot).find(selector);
    });
  }

  function getHighlightByLabel (label) {
    return getInShadowDom('.highlights').contains('.label', label).parent();
  }

  beforeEach(function () {
    cy
      .visit('http://localhost:8080/cypress/test.html')
      .document().then(function (doc) {
        addScript(doc, 'polyfill.js');
        addScript(doc, '../chrome/content.js');
      });
  });

  it('adds the container', function () {
    cy.get('.__easy-focus__container');
  });

  it('adds the background', function () {
    getInShadowDom('.background');
  });

  it('adds the right number of highlights', function () {
    getInShadowDom('.highlight').should('have.length', 21);
  });

  it('adds the right number of labels', function () {
    getInShadowDom('.label').should('have.length', 21);
  });

  it('adds the right labels', function () {
    getInShadowDom('.label').first().should('have.text', 'a')
    getInShadowDom('.label').last().should('have.text', 'u');
  });

  it('adds the labels in the right order', function () {
    cy
      .get('.off-screen input').type('a', { force: true })
      .focused().should('have.value', 'an input');
    cy
      .get('.off-screen input').type('b', { force: true })
      .focused().should('have.value', 'another input');
    cy
      .get('.off-screen input').type('c', { force: true })
      .focused().should('have.value', 'position: absolute');
    cy
      .get('.off-screen input').type('d', { force: true })
      .focused().should('have.value', 'check 1');
    cy
      .get('.off-screen input').type('n', { force: true })
      .focused().should('have.text', 'With href');
  });

  context('highlight placement and size', function () {
    it('handles inputs / regular positioning', function () {
      getHighlightByLabel('a').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('13px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles absolute positioning', function () {
      getHighlightByLabel('c').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('48px');
        expect($highlight.css('left')).to.equal('25px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles relative positioning', function () {
      getHighlightByLabel('e').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('88px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles elements with tab-index', function () {
      getHighlightByLabel('m').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('298px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('202px');
        expect($highlight.css('height')).to.equal('52px');
      });
    });

    it('handles textareas', function () {
      getHighlightByLabel('o').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('366px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('142px');
        expect($highlight.css('height')).to.equal('32px');
      });
    });

    it('handles elements with padding', function () {
      getHighlightByLabel('p').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('418px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('178px');
        expect($highlight.css('height')).to.equal('68px');
      });
    });

    it('handles checkboxes', function () {
      getHighlightByLabel('d').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('57px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('12px');
      });
    });

    it('handles radio buttons', function () {
      getHighlightByLabel('h').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('129px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('13px');
      });
    });

    it('handles select dropdowns', function () {
      getHighlightByLabel('k').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('200px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('39px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles buttons', function () {
      getHighlightByLabel('l').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('235px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('50px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles links', function () {
      getHighlightByLabel('n').should(function ($highlight) {
        expect($highlight.css('top')).to.equal('304px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('61px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });
  });

  describe('choosing a focusable', function () {
    beforeEach(function () {
      cy.get('.off-screen input').type('a', { force: true });
    });

    it('focuses the input', function () {
      cy.focused().should('have.value', 'an input');
    });

    it('removes the container', function () {
      cy.get('.__easy-focus__container').should('not.exist');
    });
  });
});
