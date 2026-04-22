import '@granite-js/react-native';

declare module '@granite-js/react-native' {
  export function createRoute<T>(path: string, options: {
    validateParams: (params: unknown) => T;
    component: import('react').ComponentType;
  }): {
    _path: string;
    useParams(): T;
    useNavigation(): { navigate(path: string, params?: Record<string, unknown>): void; goBack(): void };
  };
}
