import { Dispatch, FC, SetStateAction } from 'react';
import { trpc } from '..';
import produce from 'immer';
import { NavHomeItem, NavItem } from './NavItem';

interface Props {
    selected: string | undefined;
    setSelected: Dispatch<SetStateAction<string | undefined>>;
}

export const Nav: FC<Props> = (props) => {
    const { data: threads } = trpc.threads.getThreads.useQuery();

    const context = trpc.useContext();
    trpc.threads.threadCreated.useSubscription(undefined, {
        onData(createdThread) {
            context.threads.getThreads.setData(
                produce((threads) => {
                    // Add thread to cache
                    threads?.push(createdThread);
                }),
            );
        },
    });

    trpc.threads.threadDeleted.useSubscription(undefined, {
        onData(deletedThread) {
            context.threads.getThreads.setData(
                produce((threads) => {
                    // Find the index of the thread that was deleted
                    const index = threads?.findIndex(
                        (thread) => thread.id === deletedThread.id,
                    );

                    if (index === undefined) {
                        return;
                    }

                    // Use index to remove thread from cache
                    threads?.splice(index, 1);
                }),
            );
        },
    });

    return (
        <div className="flex flex-col gap-4 p-4 h-screen">
            <NavHomeItem {...props} />
            <div className="flex flex-col gap-4 overflow-auto">
                {threads?.map((thread) => (
                    <NavItem key={thread.id} thread={thread} {...props} />
                ))}
            </div>
        </div>
    );
};
