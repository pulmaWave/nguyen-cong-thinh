interface WalletBalance {
    currency: string;
    amount: number;
}

// FormattedWalletBalance has all properties of WalletBalance so FormattedWalletBalance can extends it to avoid redundant properties
interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

// BoxProps is not declared
interface Props extends BoxProps { }

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances(); // is not declared
    const prices = usePrices(); // is not declared

    // Inefficient: This function runs every time it's called, and it's used multiple times in sorting.
    // Better: Precompute priority before sorting instead of calling it repeatedly.
    // property 'blockchain' used any type, it should be string like below code
    const getPriority = (blockchain: any): number => {
        switch (blockchain) {
            case 'Osmosis':
                return 100;
            case 'Ethereum':
                return 50;
            case 'Arbitrum':
                return 30;
            case 'Zilliqa':
                return 20;
            case 'Neo':
                return 20;
            default:
                return -99;
        }
    };

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                // balancePriority is declared but never used
                const balancePriority = getPriority(balance.blockchain); // property 'blockchain' does not exist on type 'WalletBalance' 
                if (lhsPriority > -99) { // 'lhsPriority' is not declared, incorrect variable, should be 'balancePriority' is declared in above line
                    if (balance.amount <= 0) { // Incorrect filtering: It should remove zero balances, not keep them.
                        return true;
                    }
                }
                return false;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);
                // Inefficient: calls getPriority twice per comparison, leading to redundant calculations.
                if (leftPriority > rightPriority) {
                    return -1;
                } else if (rightPriority > leftPriority) {
                    return 1;
                }
            });
    }, [balances, prices]); // 'prices' is unnecessary in dependencies, as it's not used in sorting.

    // Inefficient: this map runs separately but could be merged with 'sortedBalances'
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
        return {
            ...balance,
            formatted: balance.amount.toFixed(),
        };
    });

    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount; // Redundant calculation inside map
        return (
            <WalletRow
                className={classes.row} // classes maybe a list of class, maybe need import
                key={index} // Using index as key is not ideal; should use a unique identifier like currency.
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={balance.formatted}
            />
        );
    });

    return <div {...rest}>{rows}</div>;
};
