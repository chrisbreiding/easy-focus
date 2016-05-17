describe('Easy Focus', () => {
  const {
    setupAndRun,
    withPrefix,
    highlightShouldHaveCss,
  } = window.__testHelpers;

  beforeEach(() => {
    setupAndRun();
  });

  it('adds the container', () => {
    cy.get(withPrefix('container'));
  });

  it('adds the background', () => {
    cy.get(withPrefix('background'));
  });

  it('adds the right number of highlights', () => {
    cy.get(withPrefix('highlight')).should('have.length', 23);
  });

  it('adds the right labels', () => {
    cy
      .get(withPrefix('label')).first().should('have.text', 'z')
      .get(withPrefix('label')).eq(14).should('have.text', 'l')
      .get(withPrefix('label')).last().should('have.text', 'a');
  });

  // need document().type() to make less flaky
  context.skip('label order', () => {
    const tests = [
      { letter: 'a', should: 'have.value', value: 'an input' },
      { letter: 'b', should: 'have.value', value: 'another input' },
      { letter: 'c', should: 'have.value', value: 'position: absolute' },
      { letter: 'd', should: 'have.value', value: 'check 1' },
      { letter: 'q', should: 'have.text',  value: 'With href' },
      { letter: 'z', should: 'have.value', value: 'last in first batch' },
    ];

    tests.forEach((test) => {
      describe(test.letter, () => {
        beforeEach(() => {
          cy.get('.test-helper').type(test.letter, { force: true });
        });
        it('has the right value', () => {
          cy.focused().should(test.should, test.value);
        });
      });
    });
  });

  context('highlight placement and size', () => {
    it('handles inputs / regular positioning', () => {
      highlightShouldHaveCss('a', {
        top: '13px', left: '5px', width: '131px', height: '19px',
      });
    });

    it('handles absolute positioning', () => {
      highlightShouldHaveCss('c', {
        top: '48px', left: '25px', width: '131px', height: '19px',
      });
    });

    it('handles relative positioning', () => {
      highlightShouldHaveCss('e', {
        top: '88px', left: '5px', width: '131px', height: '19px',
      });
    });

    it('handles elements with tab-index', () => {
      highlightShouldHaveCss('p', {
        top: '298px', left: '5px', width: '202px', height: '52px',
      });
    });

    it('handles textareas', () => {
      highlightShouldHaveCss('r', {
        top: '350px', left: '5px', width: '142px', height: '32px',
      });
    });

    it('handles elements with padding', () => {
      highlightShouldHaveCss('s', {
        top: '402px', left: '5px', width: '178px', height: '68px',
      });
    });

    it('handles checkboxes', () => {
      highlightShouldHaveCss('d', {
        top: '57px', left: '349.891px', width: '12px', height: '12px',
      });
    });

    it('handles radio buttons', () => {
      highlightShouldHaveCss('i', {
        top: '129px', left: '349.891px', width: '12px', height: '13px',
      });
    });

    it('handles select dropdowns', () => {
      highlightShouldHaveCss('n', {
        top: '200px', left: '347px', width: '39px', height: '18px',
      });
    });

    it('handles buttons', () => {
      highlightShouldHaveCss('o', {
        top: '235px', left: '347px', width: '50px', height: '18px',
      });
    });

    it('handles links', () => {
      highlightShouldHaveCss('q', {
        top: '304px', left: '347px', width: '61px', height: '18px',
      });
    });
  });

  describe('choosing a focusable', () => {
    beforeEach(() => {
      cy.get('.test-helper').type('a', { force: true });
    });

    // need document().type() to make less flaky
    it.skip('focuses the input', () => {
      cy.focused().should('have.value', 'an input');
    });

    it('removes the container', () => {
      cy.get(withPrefix('container')).should('not.exist');
    });
  });

  // need document().type() to make less flaky
  describe.skip('typing 2 or more letters in quick succession', () => {
    beforeEach(() => {
      cy.get('.test-helper').type('ab', { force: true });
    });

    it('focuses the correct input', () => {
      cy.focused().should('have.value', 'an input');
    });
  });
});
