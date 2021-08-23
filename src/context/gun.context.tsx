import React, {useState, useEffect} from 'react';

import {IGunChainReference} from 'gun/types/chain';
import {useIsMountedRef} from 'src/hooks/use-is-mounted-ref.hook';
import {initialize} from 'src/lib/gun';

type GunProviderProps = {
  peers: string[];
  children: React.ReactNode;
};

type GunContextProps = {
  loading: boolean;
  gun: IGunChainReference | null;
};

export const GunContext = React.createContext<GunContextProps>({
  loading: true,
  gun: null,
});

export const GunProvider = ({peers, ...props}: GunProviderProps): JSX.Element => {
  const mounted = useIsMountedRef();
  const [gunInstance, setGunInstance] = useState<IGunChainReference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted.current) {
      const gun = initialize(peers);

      setGunInstance(gun);
      setLoading(false);
    }
  }, [mounted]);

  const value = React.useMemo(
    () => ({
      loading,
      gun: gunInstance,
    }),
    [loading, gunInstance],
  );

  return <GunContext.Provider value={value} {...props} />;
};
