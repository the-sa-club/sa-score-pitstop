import styled from "styled-components";

export const Container = styled.div`
  max-width: 1250px;
  width: 100%;
  height: 100%;
  margin: auto;
`;

export const Align = styled.div<{ align?: string, width?:string }>`
  text-align: ${(p) => p.align ?? "inherit"};
  width: ${p => p.width ?? "inherit"};
`;
