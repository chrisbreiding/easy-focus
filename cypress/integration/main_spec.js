describe('Easy Focus', function () {

  function addScript (doc, src) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = false;
    doc.body.appendChild(script);
  }

  function withPrefix (base) {
    return '.__easy-focus__' + base;
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
    cy.get(withPrefix('container'));
  });

  it('adds the background', function () {
    cy.get(withPrefix('background'));
  });

  it('adds the right number of highlights', function () {
    cy.get(withPrefix('highlight')).should('have.length', 21);
  });

  it('adds the right number of labels', function () {
    cy.get(withPrefix('label')).should('have.length', 21);
  });

  it('adds the right labels', function () {
    cy
      .get(withPrefix('label')).first().should('have.text', 'a')
      .get(withPrefix('label')).last().should('have.text', 'u');
  });

  context('highlight placement and size', function () {
    it('handles inputs / regular positioning', function () {
      cy.contains(withPrefix('label'), 'a').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('13px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles absolute positioning', function () {
      cy.contains(withPrefix('label'), 'c').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('48px');
        expect($highlight.css('left')).to.equal('25px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles relative positioning', function () {
      cy.contains(withPrefix('label'), 'f').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('88px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles elements with tab-index', function () {
      cy.contains(withPrefix('label'), 'm').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('298px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('202px');
        expect($highlight.css('height')).to.equal('52px');
      });
    });

    it('handles textareas', function () {
      cy.contains(withPrefix('label'), 'o').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('366px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('142px');
        expect($highlight.css('height')).to.equal('32px');
      });
    });

    it('handles elements with padding', function () {
      cy.contains(withPrefix('label'), 'p').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('418px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('178px');
        expect($highlight.css('height')).to.equal('68px');
      });
    });

    it('handles checkboxes', function () {
      cy.contains(withPrefix('label'), 'd').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('57px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('12px');
      });
    });

    it('handles radio buttons', function () {
      cy.contains(withPrefix('label'), 'h').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('129px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('13px');
      });
    });

    it('handles select dropdowns', function () {
      cy.contains(withPrefix('label'), 'k').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('200px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('39px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles buttons', function () {
      cy.contains(withPrefix('label'), 'l').parent().should(function ($highlight) {
        expect($highlight.css('top')).to.equal('235px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('50px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles links', function () {
      cy.contains(withPrefix('label'), 'n').parent().should(function ($highlight) {
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
      cy.get(withPrefix('container')).should('not.exist');
    });
  });
});
