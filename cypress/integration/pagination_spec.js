describe('Easy Focus Pagination', () => {
  const {
    setupAndRun,
    withPrefix,
    highlightShouldHaveCss,
  } = window.__testHelpers;

  beforeEach(() => {
    setupAndRun();
  });

  describe('paging down', () => {
    beforeEach(() => {
      cy.get('.test-helper').type('j', { force: true });
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

    it('places and sizes the highlights correctly', () => {
      highlightShouldHaveCss('a', {
        top: '528px', left: '160px', width: '131px', height: '19px',
      });
      highlightShouldHaveCss('c', {
        top: '547px', left: '5px', width: '131px', height: '19px',
      });
      highlightShouldHaveCss('n', {
        top: '585px', left: '315px', width: '131px', height: '19px',
      });
    });

    describe('then paging down again', () => {
      beforeEach(() => {
        cy.get('.test-helper').type('j', { force: true });
      });

      it('adds the right number of highlights', () => {
        cy.get(withPrefix('highlight')).should('have.length', 12);
      });

      it('adds the right labels', () => {
        cy
          .get(withPrefix('label')).first().should('have.text', 'o')
          .get(withPrefix('label')).eq(2).should('have.text', 'm')
          .get(withPrefix('label')).last().should('have.text', 'a');
      });

      it('places and sizes the highlights correctly', () => {
        highlightShouldHaveCss('a', {
          top: '680px', left: '5px', width: '131px', height: '19px',
        });
        highlightShouldHaveCss('e', {
          top: '699px', left: '160px', width: '131px', height: '19px',
        });
        highlightShouldHaveCss('l', {
          top: '718px', left: '315px', width: '131px', height: '19px',
        });
      });

      describe('then paging up', () => {
        beforeEach(() => {
          cy.get('.test-helper').type('k', { force: true });
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

        it('places and sizes the highlights correctly', () => {
          highlightShouldHaveCss('a', {
            top: '528px', left: '160px', width: '131px', height: '19px',
          });
          highlightShouldHaveCss('c', {
            top: '547px', left: '5px', width: '131px', height: '19px',
          });
          highlightShouldHaveCss('n', {
            top: '585px', left: '315px', width: '131px', height: '19px',
          });
        });

        describe('then paging up again', () => {
          beforeEach(() => {
            cy.get('.test-helper').type('k', { force: true });
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

          it('places and sizes the highlights correctly', () => {
            highlightShouldHaveCss('a', {
              top: '13px', left: '5px', width: '131px', height: '19px',
            });
            highlightShouldHaveCss('c', {
              top: '48px', left: '25px', width: '131px', height: '19px',
            });
            highlightShouldHaveCss('q', {
              top: '304px', left: '347px', width: '61px', height: '18px',
            });
          });
        });
      });
    });
  });
});
