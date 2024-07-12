import {createElement, forwardRef} from "react";
import type {HTMLAttributes} from "react";
import {clsx} from "clsx";
import {Slot} from "@radix-ui/react-slot";
import "./styles.css";

interface CommonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
    as?: string;
}

const SlotBaseComp = forwardRef<HTMLElement, CommonProps>(function scaffoldCommon(
    {asChild, as = "div",children, ...props}: CommonProps,
    ref,
) {
    const Comp = asChild ? Slot : as;
    return createElement(Comp, {...props, ref}, children);
});

const Scaffold = forwardRef<HTMLElement, CommonProps>(function Scaffold({className, children, ...props}, ref) {
    return createElement(SlotBaseComp, {...props, className: clsx("scaffold", className), ref}, children);
});

const ScaffoldHeader = forwardRef<HTMLElement, CommonProps>(function ScaffoldHeader({
                                                                                        className,
                                                                                        children,
                                                                                        ...props
                                                                                    }, ref) {
    return createElement(SlotBaseComp, {...props, className: clsx("scaffold-header", className), ref}, children);
});

const ScaffoldBody = forwardRef<HTMLElement, CommonProps>(function ScaffoldBody({className, children, ...props}, ref) {
    return createElement(SlotBaseComp, {...props, className: clsx("scaffold-body", className), ref}, children);
});

const ScaffoldFooter = forwardRef<HTMLElement, CommonProps>(function ScaffoldFooter({
                                                                                        className,
                                                                                        children,
                                                                                        ...props
                                                                                    }, ref) {
    return createElement(SlotBaseComp, {...props, className: clsx("scaffold-footer", className), ref}, children);
});


export default {Root: Scaffold, Header: ScaffoldHeader, Body: ScaffoldBody, Footer: ScaffoldFooter};
export {
    Scaffold,
    ScaffoldHeader,
    ScaffoldBody,
    ScaffoldFooter,
};