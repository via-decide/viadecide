(function (global) {
  'use strict';

  const REQUIRED_REPO_FIELDS = ['id', 'owner', 'repo', 'role', 'status'];

  function validateRegistry(registry) {
    const errors = [];

    if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
      return { ok: false, errors: ['registry must be an object'] };
    }

    if (!Object.prototype.hasOwnProperty.call(registry, 'schemaVersion')) {
      errors.push('schemaVersion is required');
    }

    if (!Array.isArray(registry.repos)) {
      errors.push('repos must be an array');
    } else {
      registry.repos.forEach((repo, index) => {
        if (!repo || typeof repo !== 'object' || Array.isArray(repo)) {
          errors.push(`repos[${index}] must be an object`);
          return;
        }

        REQUIRED_REPO_FIELDS.forEach((field) => {
          if (!repo[field]) {
            errors.push(`repos[${index}].${field} is required`);
          }
        });
      });
    }

    return { ok: errors.length === 0, errors };
  }

  function listRepos(registry) {
    if (!validateRegistry(registry).ok) return [];

    return registry.repos.map((repo) => ({
      id: repo.id,
      owner: repo.owner,
      repo: repo.repo,
      role: repo.role,
      status: repo.status
    }));
  }

  function findRepo(registry, id) {
    if (!validateRegistry(registry).ok) return null;
    return registry.repos.find((repo) => repo.id === id) || null;
  }

  function createHandoffMessage(options) {
    const source = options && typeof options === 'object' ? options : {};

    return {
      schemaVersion: 1,
      fromRepo: source.fromRepo || '',
      toRepo: source.toRepo || '',
      type: source.type || '',
      title: source.title || '',
      body: source.body || '',
      createdAt: source.createdAt || new Date().toISOString(),
      safety: {
        textOnly: true,
        noSecrets: true,
        noBinaries: true,
        manualReviewRequired: true
      }
    };
  }

  global.DecideRepoBridge = {
    schemaVersion: 1,
    validateRegistry,
    listRepos,
    findRepo,
    createHandoffMessage
  };
})(window);
