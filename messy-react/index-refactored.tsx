interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

interface Props extends BoxProps { }

const getPriority = (blockchain: string): number => {
    const priorities: Record<string, number> = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30,
        Zilliqa: 20,
        Neo: 20,
    };
    return priorities[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance) => balance.amount <= 0 && getPriority(balance.blockchain) > -99)
            .map((balance) => ({
                ...balance,
                formatted: balance.amount.toFixed(),
                priority: getPriority(balance.blockchain),
            }))
            .sort((lhs, rhs) => rhs.priority - lhs.priority);
    }, [balances]);

    return (
        <div {...rest}>
            {sortedBalances.map((balance) => (
                <WalletRow
                    key={balance.currency}
                    className={classes.row}
                    amount={balance.amount}
                    usdValue={prices[balance.currency] * balance.amount}
                    formattedAmount={balance.formatted}
                />
            ))}
        </div>
    );
};
