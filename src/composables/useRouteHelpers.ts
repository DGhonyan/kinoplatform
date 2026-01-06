import {
  useRouter,
  type RouteParamsRawGeneric,
  type LocationQueryRaw,
} from 'vue-router';

export type NavigationOptions = {
  params?: RouteParamsRawGeneric;
  query?: LocationQueryRaw;
  newTab?: boolean;
  event?: MouseEvent;
};

export const useRouteHelpers = () => {
  const router = useRouter();

  const navigateTo = (
    routeName: string,
    options: NavigationOptions = {},
  ) => {
    const { params, query, newTab, event } = options;

    const openNewTab = newTab || event?.ctrlKey || event?.metaKey;
    const route = router.resolve({ name: routeName, params, query });

    if (openNewTab) {
      window.open(route.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(route);
    }
  };

  return {
    navigateTo,
  };
};
