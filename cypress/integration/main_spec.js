describe('Easy Focus', () => {

  function loadScript (doc, src) {
    return new Promise((resolve) => {
      const script = doc.createElement('script');
      script.src = src;
      doc.body.appendChild(script);
      let loaded = false;
      script.onreadystatechange = script.onload = () => {
        if (!loaded && (!script.readyState || /loaded|complete/.test(script.readyState))) {
          loaded = true;
          resolve();
        }
      };
    });
  }

  function withPrefix (base) {
    return `.__easy-focus__${base}`;
  }

  beforeEach(() => {
    return cy
      .visit('http://localhost:8080/cypress/test.html')
      .window().then((win) => {
        return loadScript(win.document, 'polyfill.js').then(() => {
          return loadScript(win.document, '../chrome/content.js')
        }).then(() => {
          win.chrome.__sendMessageToContent({
            type: 'commands',
            commands: [{ shortcut: '' }, { shortcut: 'Alt+Shift+F' }],
          });
        });
      });
  });

  it('adds the container', () => {
    cy.get(withPrefix('container'));
  });

  it('adds the background', () => {
    cy.get(withPrefix('background'));
  });

  it('adds the right number of highlights', () => {
    cy.get(withPrefix('highlight')).should('have.length', 21);
  });

  it('adds the right number of labels', () => {
    cy.get(withPrefix('label')).should('have.length', 21);
  });

  it('adds the right labels', () => {
    cy
      .get(withPrefix('label')).first().should('have.text', 'v')
      .get(withPrefix('label')).last().should('have.text', 'a');
  });

  // need document.type()
  it.skip('adds the labels in the right order', () => {
    cy
      .get('.off-screen input').type('a', { force: true })
      .focused().should('have.value', 'an input');
    cy
      .get('.off-screen input').type('b', { force: true })
      .focused().debug().should('have.value', 'another input');
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

  context('highlight placement and size', () => {
    it('handles inputs / regular positioning', () => {
      cy.contains(withPrefix('label'), 'a').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('13px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles absolute positioning', () => {
      cy.contains(withPrefix('label'), 'c').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('48px');
        expect($highlight.css('left')).to.equal('25px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles relative positioning', () => {
      cy.contains(withPrefix('label'), 'e').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('88px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('131px');
        expect($highlight.css('height')).to.equal('19px');
      });
    });

    it('handles elements with tab-index', () => {
      cy.contains(withPrefix('label'), 'n').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('298px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('202px');
        expect($highlight.css('height')).to.equal('52px');
      });
    });

    it('handles textareas', () => {
      cy.contains(withPrefix('label'), 'p').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('366px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('142px');
        expect($highlight.css('height')).to.equal('32px');
      });
    });

    it('handles elements with padding', () => {
      cy.contains(withPrefix('label'), 'q').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('418px');
        expect($highlight.css('left')).to.equal('5px');
        expect($highlight.css('width')).to.equal('178px');
        expect($highlight.css('height')).to.equal('68px');
      });
    });

    it('handles checkboxes', () => {
      cy.contains(withPrefix('label'), 'd').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('57px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('12px');
      });
    });

    it('handles radio buttons', () => {
      cy.contains(withPrefix('label'), 'i').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('129px');
        expect($highlight.css('left')).to.equal('349.891px');
        expect($highlight.css('width')).to.equal('12px');
        expect($highlight.css('height')).to.equal('13px');
      });
    });

    it('handles select dropdowns', () => {
      cy.contains(withPrefix('label'), 'l').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('200px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('39px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles buttons', () => {
      cy.contains(withPrefix('label'), 'm').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('235px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('50px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });

    it('handles links', () => {
      cy.contains(withPrefix('label'), 'o').parent().should(($highlight) => {
        expect($highlight.css('top')).to.equal('304px');
        expect($highlight.css('left')).to.equal('347px');
        expect($highlight.css('width')).to.equal('61px');
        expect($highlight.css('height')).to.equal('18px');
      });
    });
  });

  describe('choosing a focusable', () => {
    beforeEach(() => {
      cy.get('.off-screen input').type('a', { force: true });
    });

    // need document.type()
    it.skip('focuses the input', () => {
      cy.focused().should('have.value', 'an input');
    });

    // need document.type()
    it.skip('puts the cursor at the end of the text', () => {
      cy.focused().type(' with more text').should('have.value', 'an input with more text');
    });

    it('removes the container', () => {
      cy.get(withPrefix('container')).should('not.exist');
    });
  });


  describe.skip('typing 2 or more letters in quick succession', () => {
    beforeEach(() => {
      cy.get('.off-screen input').type('ab', { force: true });
    });

    it('focuses the correct input', () => {
      cy.focused().should('have.value', 'an input');
    });
  });
});
