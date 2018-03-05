(function(history, map, threshold) {
  const matchRoute = (route, declaration) => {
    const routeParts = route.split('/');
    const declarationParts = declaration.split('/');
    if (routeParts.length > 0 && routeParts[routeParts.length - 1] === '') {
      routeParts.pop();
    }

    if (declarationParts.length > 0 && declarationParts[declarationParts.length - 1] === '') {
      declarationParts.pop();
    }

    if (routeParts.length !== declarationParts.length) {
      return false;
    } else {
      return declarationParts.reduce((a, p, i) => {
        if (p.startsWith(':')) {
          return a;
        }
        return a && p === routeParts[i];
      }, true);
    }
  };

  const handleNavigationChange = route => {
    const current = Object.keys(map)
      .filter(matchRoute.bind(null, route))
      .pop();
    if (!current) {
      return;
    }
    for (const route of map[current]) {
      if (route.probability < threshold) {
        continue;
      }
      if (route.chunk) {
        console.log('Prefetchink', route.chunk);
        import('/' + route.chunk);
      } else {
        console.log('Cannot find chunk for', route.route);
      }
    }
  };

  window.addEventListener('popstate', e => handleNavigationChange(location.pathname));

  const pushState = history.pushState;
  history.pushState = function(state) {
    if (typeof history.onpushstate == 'function') {
      history.onpushstate({ state: state });
    }
    handleNavigationChange(arguments[2]);
    return pushState.apply(history, arguments);
  };
})(window.history, __PREFETCH_MAP__, 0.2);
