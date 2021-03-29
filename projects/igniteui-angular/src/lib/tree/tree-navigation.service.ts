import { EventEmitter, Injectable } from '@angular/core';
import { IgxTree, IgxTreeNode, IGX_TREE_SELECTION_TYPE } from './common';
import { NAVIGATION_KEYS } from '../core/utils';
import { IgxTreeService } from './tree.service';

@Injectable()
export class IgxTreeNavigationService {
    private tree: IgxTree;

    private _focusedNode: IgxTreeNode<any> = null;
    private _lastFocusedNode: IgxTreeNode<any> = null;
    private _activeNode: IgxTreeNode<any> = null;

    private _visibleChildren: IgxTreeNode<any>[] = [];
    private _invisibleChildren: Set<IgxTreeNode<any>> = new Set();
    private _disabledChildren: Set<IgxTreeNode<any>> = new Set();

    private _cacheChange = new EventEmitter<void>();

    constructor(private treeService: IgxTreeService) {
        this._cacheChange.subscribe(() => {
            this._visibleChildren =
                this.tree.nodes ?
                    this.tree.nodes.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
                    [];
        });
    }

    /** @hidden @internal */
    public register(tree: IgxTree) {
        this.tree = tree;
    }

    public get focusedNode() {
        return this._focusedNode;
    }

    public set focusedNode(value: IgxTreeNode<any>) {
        if (this._focusedNode === value) {
            return;
        }
        this._lastFocusedNode = this._focusedNode;
        if (this._lastFocusedNode) {
            this._lastFocusedNode.tabIndex = -1;
        }
        this._focusedNode = value;
        if (this._focusedNode !== null) {
            this._focusedNode.tabIndex = 0;
            (this._focusedNode as any).header.nativeElement.focus();
        }
    }

    public get activeNode() {
        return this._activeNode;
    }

    public set activeNode(value: IgxTreeNode<any>) {
        if (this._activeNode === value) {
            return;
        }
        this._activeNode = value;
        this.tree.activeNodeChanged.emit(this._activeNode);
    }

    /** @hidden @internal */
    public get visibleChildren(): IgxTreeNode<any>[] {
        return this._visibleChildren;
    }

    /** @hidden @internal */
    public update_disabled_cache(node: IgxTreeNode<any>): void {
        if (node.disabled) {
            this._disabledChildren.add(node);
        } else {
            this._disabledChildren.delete(node);
        }
        this._cacheChange.emit();
    }

    /** @hidden @internal */
    public init_invisible_cache() {
        this.tree.nodes.filter(e => e.level === 0).forEach(node => {
            this.update_visible_cache(node, node.expanded, false);
        });
        this._cacheChange.emit();
    }

    /** @hidden @internal */
    public update_visible_cache(node: IgxTreeNode<any>, expanded: boolean, shouldEmit = true): void {
        if (expanded) {
            node.children.forEach(child => {
                this._invisibleChildren.delete(child);
                this.update_visible_cache(child, child.expanded, false);
            });
        } else {
            node.allChildren.forEach(c => this._invisibleChildren.add(c));
        }

        if (shouldEmit) {
            this._cacheChange.emit();
        }
    }

    /** @hidden @internal */
    public setFocusedAndActiveNode(node: IgxTreeNode<any>, isActive: boolean = true) {
        if (isActive) {
            this.activeNode = node;
        }
        this.focusedNode = node;
    }

    /** @hidden @internal */
    public handleKeydown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.focusedNode) {
            return;
        }
        if (!(NAVIGATION_KEYS.has(key) || key === '*')) {
            if (key === 'enter') {
                this.setFocusedAndActiveNode(this.focusedNode);
            }
            return;
        }
        event.preventDefault();
        // if (event.repeat && NAVIGATION_KEYS.has(key)) {
        //     event.preventDefault();
        // }
        if (event.repeat) {
            setTimeout(() => this.handleNavigation(event), 1);
        } else {
            this.handleNavigation(event);
        }
    }

    private handleNavigation(event: KeyboardEvent) {
        switch (event.key.toLowerCase()) {
            case 'home':
                this.setFocusedAndActiveNode(this.tree.nodes.first);
                break;
            case 'end':
                this.setFocusedAndActiveNode(this.visibleChildren[this.visibleChildren.length - 1]);
                break;
            case 'arrowleft':
            case 'left':
                this.handleArrowLeft();
                break;
            case 'arrowright':
            case 'right':
                this.handleArrowRight();
                break;
            case 'arrowup':
            case 'up':
                this.handleUpDownArrow(true, event);
                break;
            case 'arrowdown':
            case 'down':
                this.handleUpDownArrow(false, event);
                break;
            case '*':
                this.handleAsterisk();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                this.handleSpace(event.shiftKey);
                break;
            default:
                return;
        }
    }

    private handleArrowLeft() {
        if (this.focusedNode.expanded && !this.treeService.collapsingNodes.has(this.focusedNode) && this.focusedNode.children?.length) {
            this.setFocusedAndActiveNode(this.focusedNode);
            this.focusedNode.collapse();
        } else {
            if (this.focusedNode.parentNode && !this.focusedNode.parentNode.disabled) {
                this.setFocusedAndActiveNode(this.focusedNode.parentNode);
            }
        }
    }

    private handleArrowRight() {
        if (this.focusedNode.children.length > 0) {
            if (!this.focusedNode.expanded) {
                this.setFocusedAndActiveNode(this.focusedNode);
                this.focusedNode.expand();
            } else {
                if (this.treeService.collapsingNodes.has(this.focusedNode)) {
                    this.focusedNode.expand();
                    return;
                }
                const firstChild = this.focusedNode.children.toArray().find(node => node.disabled === false);
                if (firstChild) {
                    this.setFocusedAndActiveNode(firstChild);
                }
            }
        }
    }

    private handleUpDownArrow(isUp: boolean, event: KeyboardEvent) {
        const next = isUp ? this.tree.getPreviousNode(this.focusedNode) :
            this.tree.getNextNode(this.focusedNode);
        if (next === this.focusedNode) {
            return;
        }
        // event.preventDefault();

        if (event.ctrlKey) {
            this.setFocusedAndActiveNode(next, false);
        } else {
            this.setFocusedAndActiveNode(next);
        }
    }

    private handleAsterisk() {
        if (this.focusedNode.parentNode) {
            const children = this.focusedNode.parentNode.children;
            children.forEach(child => {
                if (!child.disabled && (!child.expanded || this.treeService.collapsingNodes.has(child))) {
                    child.expand();
                }
            });
        } else {
            const rootNodes = this.tree.nodes.filter(node => node.level === 0);
            rootNodes.forEach(node => {
                if (!node.disabled && (!node.expanded || this.treeService.collapsingNodes.has(node))) {
                    node.expand();
                }
            });
        }
    }

    private handleSpace(shiftKey = false) {
        if (this.tree.selection === IGX_TREE_SELECTION_TYPE.None) {
            return;
        }

        this.setFocusedAndActiveNode(this.focusedNode);
        if (shiftKey) {
            (this.tree as any).selectionService.selectMultipleNodes(this.focusedNode);
            return;
        }

        if (this.focusedNode.selected) {
            (this.tree as any).selectionService.deselectNode(this.focusedNode);
        } else {
            (this.tree as any).selectionService.selectNode(this.focusedNode);
        }
    }
}