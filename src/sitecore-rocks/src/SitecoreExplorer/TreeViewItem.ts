import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { SitecoreExplorerProvider } from "../SitecoreExplorer";
import { isConnectionTreeViewItem } from "./ConnectionTreeViewItem";
import { SitecoreTreeItem } from "./SitecoreTreeItem";

export abstract class TreeViewItem {

    public treeItem: SitecoreTreeItem;

    public children: TreeViewItem[];

    constructor(public sitecoreExplorer: SitecoreExplorerProvider, public parent?: TreeViewItem) {
    }

    public abstract getTreeItem(): TreeItem;

    public abstract getChildren(): TreeViewItem[] | Thenable<TreeViewItem[]>;

    public abstract getUri(): string;

    public expand(itemUris: string[]): Thenable<boolean> {
        return new Promise<boolean>((completed, error) => {
            const itemUri = itemUris[0];

            this.expandTreeItem().then(isExpanded => {
                if (!this.children) {
                    completed(false);
                    return;
                }

                const treeViewItem = this.children.find(i => i.getUri() === itemUri);
                if (treeViewItem) {
                    if (itemUris.length > 2) {
                        treeViewItem.expand(itemUris.slice(1)).then(ok => completed(ok));
                    } else {
                        completed(true);
                    }
                } else {
                    completed(false);
                }
            });
        });
    }

    public expandTreeItem(): Thenable<boolean> {
        return new Promise<boolean>((completed, error) => {
            if (this.treeItem.collapsibleState === TreeItemCollapsibleState.Expanded) {
                completed(true);
                return;
            }

            // todo: this does not work
            this.treeItem.collapsibleState = TreeItemCollapsibleState.Expanded;

            const pollChildren = () => {
                if (!this.children) {
                    setTimeout(pollChildren, 1);
                } else {
                    completed(true);
                }
            };

            pollChildren();
        });
    }
}
